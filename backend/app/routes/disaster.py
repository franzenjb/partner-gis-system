"""Disaster Response & Status endpoints."""
import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.disaster import (
    DisasterCapability, DisasterStatus,
    CapabilityType, CapabilityPhase, OperationalStatus
)
from ..schemas import (
    DisasterCapabilityCreate, DisasterCapabilityResponse,
    DisasterStatusCreate, DisasterStatusResponse
)

router = APIRouter()


# ============= Capabilities =============

@router.get("/capabilities", response_model=List[DisasterCapabilityResponse])
async def list_capabilities(
    partner_id: Optional[str] = None,
    capability_type: Optional[CapabilityType] = None,
    phase: Optional[CapabilityPhase] = None,
    db: AsyncSession = Depends(get_db),
):
    """List disaster capabilities."""
    query = select(DisasterCapability).where(DisasterCapability.is_current == True)

    if partner_id:
        try:
            pid = uuid.UUID(partner_id)
            query = query.where(DisasterCapability.partner_id == pid)
        except ValueError:
            pass

    if capability_type:
        query = query.where(DisasterCapability.capability_type == capability_type)

    if phase:
        query = query.where(
            (DisasterCapability.capability_phase == phase) |
            (DisasterCapability.capability_phase == CapabilityPhase.BOTH)
        )

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/capabilities/summary")
async def get_capabilities_summary(db: AsyncSession = Depends(get_db)):
    """Get summary of all disaster capabilities by type."""
    query = select(DisasterCapability).where(DisasterCapability.is_current == True)
    result = await db.execute(query)
    capabilities = result.scalars().all()

    summary = {}
    for cap in capabilities:
        cap_type = cap.capability_type.value
        if cap_type not in summary:
            summary[cap_type] = {
                "count": 0,
                "total_staff_capacity": 0,
                "total_volunteer_capacity": 0,
                "total_space_sqft": 0,
            }
        summary[cap_type]["count"] += 1
        summary[cap_type]["total_staff_capacity"] += cap.staff_capacity or 0
        summary[cap_type]["total_volunteer_capacity"] += cap.volunteer_capacity or 0
        summary[cap_type]["total_space_sqft"] += cap.space_available_sqft or 0

    return summary


@router.post("/capabilities", response_model=DisasterCapabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_capability(
    capability_data: DisasterCapabilityCreate,
    db: AsyncSession = Depends(get_db),
):
    """Add a disaster capability for a partner."""
    capability = DisasterCapability(**capability_data.model_dump())
    db.add(capability)
    await db.commit()
    await db.refresh(capability)
    return capability


# ============= Real-time Status =============

@router.get("/status", response_model=List[DisasterStatusResponse])
async def list_disaster_status(
    event_name: Optional[str] = None,
    operational_status: Optional[OperationalStatus] = None,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """List current disaster status reports."""
    query = select(DisasterStatus)

    if active_only:
        # Only show non-expired statuses
        query = query.where(
            (DisasterStatus.expires_at == None) |
            (DisasterStatus.expires_at > datetime.utcnow())
        )

    if event_name:
        query = query.where(DisasterStatus.disaster_event_name == event_name)

    if operational_status:
        query = query.where(DisasterStatus.operational_status == operational_status)

    query = query.order_by(DisasterStatus.last_updated.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/status/events")
async def list_active_events(db: AsyncSession = Depends(get_db)):
    """List all active disaster events."""
    query = select(DisasterStatus.disaster_event_name).distinct().where(
        (DisasterStatus.expires_at == None) |
        (DisasterStatus.expires_at > datetime.utcnow())
    )

    result = await db.execute(query)
    events = result.scalars().all()

    return {"active_events": events}


@router.post("/status", response_model=DisasterStatusResponse, status_code=status.HTTP_201_CREATED)
async def create_status(
    status_data: DisasterStatusCreate,
    expires_hours: int = 72,
    db: AsyncSession = Depends(get_db),
):
    """Submit a disaster status update."""
    status_obj = DisasterStatus(
        **status_data.model_dump(),
        expires_at=datetime.utcnow() + timedelta(hours=expires_hours),
    )
    db.add(status_obj)
    await db.commit()
    await db.refresh(status_obj)
    return status_obj


@router.put("/status/{status_id}", response_model=DisasterStatusResponse)
async def update_status(
    status_id: str,
    operational_status: OperationalStatus,
    status_notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing status report."""
    try:
        sid = uuid.UUID(status_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status ID")

    result = await db.execute(select(DisasterStatus).where(DisasterStatus.id == sid))
    status_obj = result.scalar_one_or_none()

    if not status_obj:
        raise HTTPException(status_code=404, detail="Status not found")

    status_obj.operational_status = operational_status
    if status_notes:
        status_obj.status_notes = status_notes
    status_obj.last_updated = datetime.utcnow()

    await db.commit()
    await db.refresh(status_obj)

    return status_obj


@router.get("/dashboard")
async def disaster_dashboard(
    event_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get disaster dashboard data."""
    # Get capabilities summary
    cap_query = select(DisasterCapability).where(DisasterCapability.is_current == True)
    cap_result = await db.execute(cap_query)
    capabilities = cap_result.scalars().all()

    # Get active statuses
    status_query = select(DisasterStatus).where(
        (DisasterStatus.expires_at == None) |
        (DisasterStatus.expires_at > datetime.utcnow())
    )
    if event_name:
        status_query = status_query.where(DisasterStatus.disaster_event_name == event_name)

    status_result = await db.execute(status_query)
    statuses = status_result.scalars().all()

    # Aggregate
    status_counts = {
        "operational": 0,
        "limited": 0,
        "not_operational": 0,
        "unknown": 0,
    }
    for s in statuses:
        status_counts[s.operational_status.value] += 1

    return {
        "total_disaster_capable_partners": len(set(c.partner_id for c in capabilities)),
        "total_capabilities": len(capabilities),
        "active_status_reports": len(statuses),
        "status_breakdown": status_counts,
        "capabilities_by_type": {
            ct.value: len([c for c in capabilities if c.capability_type == ct])
            for ct in CapabilityType
        },
    }
