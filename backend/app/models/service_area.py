"""Service Areas - Layer 3 (Polygon Feature Layer)."""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry

from ..database import Base


class ServiceAreaType(str, Enum):
    ZIP_CODE = "zip_code"
    CENSUS_TRACT = "census_tract"
    NEIGHBORHOOD = "neighborhood"
    CITY = "city"
    COUNTY = "county"
    BUFFER = "buffer"  # Distance-based
    DRIVE_TIME = "drive_time"  # Isochrone
    CUSTOM = "custom"


class ServiceAreaContext(str, Enum):
    STEADY_STATE = "steady_state"
    DISASTER = "disaster"
    BOTH = "both"


class ServiceArea(Base):
    """
    Polygon layer for service areas.

    Supports multiple area types:
    - Administrative boundaries (ZIP, tract, city, county)
    - Buffer zones (0.5, 1, 5 mile)
    - Drive-time isochrones (10, 20, 30 min)
    - Custom polygons

    Used for:
    - Coverage analysis vs vulnerability layers
    - Gap identification
    - Equity assessment
    """

    __tablename__ = "service_areas"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False
    )

    # Area Definition
    area_type: Mapped[ServiceAreaType] = mapped_column(
        SQLEnum(ServiceAreaType), nullable=False, index=True
    )
    area_id: Mapped[Optional[str]] = mapped_column(String(100))  # ZIP code, FIPS, etc.
    area_name: Mapped[Optional[str]] = mapped_column(String(255))

    # Geometry - PostGIS Polygon/MultiPolygon
    geometry: Mapped[Optional[str]] = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326)
    )

    # For buffer/isochrone types
    buffer_distance_miles: Mapped[Optional[float]] = mapped_column()
    drive_time_minutes: Mapped[Optional[int]] = mapped_column()

    # Context
    service_context: Mapped[ServiceAreaContext] = mapped_column(
        SQLEnum(ServiceAreaContext), default=ServiceAreaContext.BOTH
    )

    # Computed fields (populated by analysis)
    population_covered: Mapped[Optional[int]] = mapped_column()
    svi_score_avg: Mapped[Optional[float]] = mapped_column()  # Average SVI in area

    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Metadata
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationship
    partner = relationship("Partner", back_populates="service_areas")

    def __repr__(self):
        return f"<ServiceArea {self.area_type}: {self.area_name or self.area_id}>"
