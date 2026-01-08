"""Partner CRUD endpoints."""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.functions import ST_SetSRID, ST_MakePoint

from ..database import get_db
from ..models.partner import Partner
from ..schemas import PartnerCreate, PartnerUpdate, PartnerResponse, PartnerListResponse

router = APIRouter()


def generate_partner_id() -> str:
    """Generate a human-readable partner ID."""
    short_uuid = str(uuid.uuid4())[:8].upper()
    return f"PTR-{short_uuid}"


@router.get("/", response_model=List[PartnerListResponse])
async def list_partners(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """List all partners with basic info for map display."""
    query = select(Partner)
    if active_only:
        query = query.where(Partner.is_active == True)
    query = query.offset(skip).limit(limit).order_by(Partner.organization_name)

    result = await db.execute(query)
    partners = result.scalars().all()
    return partners


@router.get("/geojson")
async def get_partners_geojson(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """Get all partners as GeoJSON for map display."""
    query = select(Partner)
    if active_only:
        query = query.where(Partner.is_active == True)

    result = await db.execute(query)
    partners = result.scalars().all()

    features = []
    for p in partners:
        if p.latitude and p.longitude:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [p.longitude, p.latitude],
                },
                "properties": {
                    "id": str(p.id),
                    "partner_id": p.partner_id,
                    "name": p.organization_name,
                    "type": p.organization_type.value if p.organization_type else None,
                    "address": p.physical_address,
                    "ada_accessible": p.ada_accessible.value if p.ada_accessible else None,
                },
            })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.get("/{partner_id}", response_model=PartnerResponse)
async def get_partner(partner_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single partner by ID."""
    # Try UUID first, then partner_id string
    try:
        partner_uuid = uuid.UUID(partner_id)
        query = select(Partner).where(Partner.id == partner_uuid)
    except ValueError:
        query = select(Partner).where(Partner.partner_id == partner_id)

    result = await db.execute(query)
    partner = result.scalar_one_or_none()

    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    return partner


@router.post("/", response_model=PartnerResponse, status_code=status.HTTP_201_CREATED)
async def create_partner(partner_data: PartnerCreate, db: AsyncSession = Depends(get_db)):
    """Create a new partner."""
    partner = Partner(
        partner_id=generate_partner_id(),
        **partner_data.model_dump(),
    )

    # Set PostGIS point if coordinates provided
    if partner_data.latitude and partner_data.longitude:
        partner.location = func.ST_SetSRID(
            func.ST_MakePoint(partner_data.longitude, partner_data.latitude),
            4326
        )

    db.add(partner)
    await db.commit()
    await db.refresh(partner)

    return partner


@router.put("/{partner_id}", response_model=PartnerResponse)
async def update_partner(
    partner_id: str,
    partner_data: PartnerUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing partner."""
    try:
        partner_uuid = uuid.UUID(partner_id)
        query = select(Partner).where(Partner.id == partner_uuid)
    except ValueError:
        query = select(Partner).where(Partner.partner_id == partner_id)

    result = await db.execute(query)
    partner = result.scalar_one_or_none()

    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    # Update fields
    update_data = partner_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(partner, field, value)

    # Update PostGIS point if coordinates changed
    if "latitude" in update_data or "longitude" in update_data:
        lat = update_data.get("latitude", partner.latitude)
        lng = update_data.get("longitude", partner.longitude)
        if lat and lng:
            partner.location = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)

    await db.commit()
    await db.refresh(partner)

    return partner


@router.delete("/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_partner(partner_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a partner (soft delete - sets is_active to False)."""
    try:
        partner_uuid = uuid.UUID(partner_id)
        query = select(Partner).where(Partner.id == partner_uuid)
    except ValueError:
        query = select(Partner).where(Partner.partner_id == partner_id)

    result = await db.execute(query)
    partner = result.scalar_one_or_none()

    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    partner.is_active = False
    await db.commit()


@router.post("/{partner_id}/approve")
async def approve_partner(partner_id: str, db: AsyncSession = Depends(get_db)):
    """Approve a pending partner."""
    from ..models.partner import ApprovalStatus

    try:
        partner_uuid = uuid.UUID(partner_id)
        query = select(Partner).where(Partner.id == partner_uuid)
    except ValueError:
        query = select(Partner).where(Partner.partner_id == partner_id)

    result = await db.execute(query)
    partner = result.scalar_one_or_none()

    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    partner.approval_status = ApprovalStatus.APPROVED
    await db.commit()

    return {"status": "approved", "partner_id": partner.partner_id}
