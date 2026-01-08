"""Spatial and attribute search endpoints."""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.functions import ST_DWithin, ST_Distance, ST_SetSRID, ST_MakePoint, ST_Transform

from ..database import get_db
from ..models.partner import Partner, OrganizationType
from ..models.service import Service, ServiceCategoryType

router = APIRouter()


@router.get("/partners")
async def search_partners(
    q: Optional[str] = Query(None, description="Text search in name/address"),
    service_category: Optional[ServiceCategoryType] = None,
    service_type: Optional[str] = None,
    organization_type: Optional[OrganizationType] = None,
    languages: Optional[List[str]] = Query(None),
    ada_accessible: Optional[bool] = None,
    has_backup_power: Optional[bool] = None,
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lng: Optional[float] = Query(None, ge=-180, le=180),
    radius_miles: float = Query(10, le=100),
    limit: int = Query(50, le=500),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """
    Search for partners with multiple filters.

    Supports:
    - Text search (name, address)
    - Service category/type filtering
    - Spatial search (within radius of point)
    - Attribute filtering (languages, accessibility, etc.)
    """
    # Base query
    query = select(Partner).where(Partner.is_active == True)

    # Text search
    if q:
        search_term = f"%{q}%"
        query = query.where(
            or_(
                Partner.organization_name.ilike(search_term),
                Partner.physical_address.ilike(search_term),
                Partner.alternate_names.ilike(search_term),
            )
        )

    # Organization type
    if organization_type:
        query = query.where(Partner.organization_type == organization_type)

    # Language filter
    if languages:
        query = query.where(Partner.languages_offered.overlap(languages))

    # ADA accessibility
    if ada_accessible is not None:
        from ..models.partner import AccessibilityLevel
        if ada_accessible:
            query = query.where(Partner.ada_accessible == AccessibilityLevel.YES)
        else:
            query = query.where(Partner.ada_accessible != AccessibilityLevel.YES)

    # Backup power
    if has_backup_power is not None:
        if has_backup_power:
            query = query.where(Partner.backup_power != None)
            query = query.where(Partner.backup_power != "none")
        else:
            query = query.where(
                or_(Partner.backup_power == None, Partner.backup_power == "none")
            )

    # Service category/type filter - join with services
    if service_category or service_type:
        service_subquery = select(Service.partner_id).where(Service.is_active == True)
        if service_category:
            service_subquery = service_subquery.where(Service.category == service_category)
        if service_type:
            service_subquery = service_subquery.where(Service.service_type == service_type)
        query = query.where(Partner.id.in_(service_subquery))

    # Spatial search
    if lat is not None and lng is not None:
        # Convert miles to meters (1 mile = 1609.34 meters)
        radius_meters = radius_miles * 1609.34
        point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)

        # Filter by distance and order by distance
        query = query.where(
            func.ST_DWithin(
                func.ST_Transform(Partner.location, 3857),  # Web Mercator for distance
                func.ST_Transform(point, 3857),
                radius_meters
            )
        ).order_by(
            func.ST_Distance(Partner.location, point)
        )
    else:
        query = query.order_by(Partner.organization_name)

    # Pagination
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    partners = result.scalars().all()

    # Format response
    return {
        "count": len(partners),
        "offset": offset,
        "limit": limit,
        "results": [
            {
                "id": str(p.id),
                "partner_id": p.partner_id,
                "name": p.organization_name,
                "type": p.organization_type.value if p.organization_type else None,
                "address": p.physical_address,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "languages": p.languages_offered,
                "ada_accessible": p.ada_accessible.value if p.ada_accessible else None,
            }
            for p in partners
        ],
    }


@router.get("/nearby")
async def find_nearby_partners(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius_miles: float = Query(5, le=50),
    service_category: Optional[ServiceCategoryType] = None,
    limit: int = Query(20, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Find partners near a specific location."""
    radius_meters = radius_miles * 1609.34
    point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)

    query = select(
        Partner,
        func.ST_Distance(
            func.ST_Transform(Partner.location, 3857),
            func.ST_Transform(point, 3857)
        ).label("distance_meters")
    ).where(
        Partner.is_active == True,
        func.ST_DWithin(
            func.ST_Transform(Partner.location, 3857),
            func.ST_Transform(point, 3857),
            radius_meters
        )
    )

    # Service filter
    if service_category:
        service_subquery = select(Service.partner_id).where(
            Service.is_active == True,
            Service.category == service_category,
        )
        query = query.where(Partner.id.in_(service_subquery))

    query = query.order_by("distance_meters").limit(limit)

    result = await db.execute(query)
    rows = result.all()

    return {
        "search_location": {"lat": lat, "lng": lng},
        "radius_miles": radius_miles,
        "count": len(rows),
        "results": [
            {
                "id": str(row.Partner.id),
                "partner_id": row.Partner.partner_id,
                "name": row.Partner.organization_name,
                "address": row.Partner.physical_address,
                "latitude": row.Partner.latitude,
                "longitude": row.Partner.longitude,
                "distance_miles": round(row.distance_meters / 1609.34, 2),
            }
            for row in rows
        ],
    }


@router.get("/services")
async def search_services(
    q: Optional[str] = None,
    category: Optional[ServiceCategoryType] = None,
    access_type: Optional[str] = None,
    languages: Optional[List[str]] = Query(None),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lng: Optional[float] = Query(None, ge=-180, le=180),
    radius_miles: float = Query(10, le=100),
    limit: int = Query(50, le=500),
    db: AsyncSession = Depends(get_db),
):
    """Search for services across all partners."""
    # Join services with partners for location filtering
    query = select(Service, Partner).join(Partner).where(
        Service.is_active == True,
        Partner.is_active == True,
    )

    if q:
        search_term = f"%{q}%"
        query = query.where(
            or_(
                Service.service_name.ilike(search_term),
                Service.service_type.ilike(search_term),
                Service.description.ilike(search_term),
            )
        )

    if category:
        query = query.where(Service.category == category)

    if access_type:
        from ..models.service import AccessType
        query = query.where(Service.access_type == access_type)

    if languages:
        query = query.where(Service.languages_offered.overlap(languages))

    # Spatial filter on partner location
    if lat is not None and lng is not None:
        radius_meters = radius_miles * 1609.34
        point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
        query = query.where(
            func.ST_DWithin(
                func.ST_Transform(Partner.location, 3857),
                func.ST_Transform(point, 3857),
                radius_meters
            )
        )

    query = query.limit(limit)

    result = await db.execute(query)
    rows = result.all()

    return {
        "count": len(rows),
        "results": [
            {
                "service_id": str(row.Service.id),
                "service_type": row.Service.service_type,
                "category": row.Service.category.value,
                "service_name": row.Service.service_name,
                "access_type": row.Service.access_type.value,
                "languages": row.Service.languages_offered,
                "partner": {
                    "id": str(row.Partner.id),
                    "name": row.Partner.organization_name,
                    "address": row.Partner.physical_address,
                    "latitude": row.Partner.latitude,
                    "longitude": row.Partner.longitude,
                },
            }
            for row in rows
        ],
    }
