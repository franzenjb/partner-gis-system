"""Service CRUD endpoints."""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.service import Service, ServiceCategoryType
from ..schemas import ServiceCreate, ServiceResponse

router = APIRouter()


@router.get("/", response_model=List[ServiceResponse])
async def list_services(
    partner_id: Optional[str] = None,
    category: Optional[ServiceCategoryType] = None,
    service_type: Optional[str] = None,
    active_only: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """List services with optional filters."""
    query = select(Service)

    if partner_id:
        try:
            pid = uuid.UUID(partner_id)
            query = query.where(Service.partner_id == pid)
        except ValueError:
            pass

    if category:
        query = query.where(Service.category == category)

    if service_type:
        query = query.where(Service.service_type == service_type)

    if active_only:
        query = query.where(Service.is_active == True)

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/categories")
async def get_service_categories():
    """Get all service categories and types."""
    from ..models.service import SERVICE_TYPES

    return {
        category.value: types
        for category, types in SERVICE_TYPES.items()
    }


@router.get("/by-category/{category}")
async def get_services_by_category(
    category: ServiceCategoryType,
    db: AsyncSession = Depends(get_db),
):
    """Get all services in a category with partner info."""
    query = select(Service).where(
        Service.category == category,
        Service.is_active == True,
    )

    result = await db.execute(query)
    services = result.scalars().all()

    # Group by service type
    grouped = {}
    for s in services:
        if s.service_type not in grouped:
            grouped[s.service_type] = []
        grouped[s.service_type].append({
            "id": str(s.id),
            "partner_id": str(s.partner_id),
            "service_name": s.service_name,
            "access_type": s.access_type.value,
            "languages": s.languages_offered,
        })

    return grouped


@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single service."""
    try:
        sid = uuid.UUID(service_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid service ID")

    result = await db.execute(select(Service).where(Service.id == sid))
    service = result.scalar_one_or_none()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    return service


@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(service_data: ServiceCreate, db: AsyncSession = Depends(get_db)):
    """Create a new service for a partner."""
    service = Service(**service_data.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a service (soft delete)."""
    try:
        sid = uuid.UUID(service_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid service ID")

    result = await db.execute(select(Service).where(Service.id == sid))
    service = result.scalar_one_or_none()

    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    service.is_active = False
    await db.commit()
