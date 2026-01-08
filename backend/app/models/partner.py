"""Partner Core Profile - Layer 1 (Primary Point Feature Layer)."""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlalchemy import String, Text, Boolean, Integer, Float, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry

from ..database import Base


class OrganizationType(str, Enum):
    NONPROFIT = "nonprofit"
    FAITH_BASED = "faith_based"
    GOVERNMENT = "government"
    INFORMAL = "informal"
    COALITION = "coalition"
    PRIVATE = "private"


class FacilityType(str, Enum):
    OFFICE = "office"
    WAREHOUSE = "warehouse"
    COMMUNITY_CENTER = "community_center"
    CHURCH = "church"
    SCHOOL = "school"
    MOBILE = "mobile"
    OTHER = "other"


class AccessibilityLevel(str, Enum):
    YES = "yes"
    PARTIAL = "partial"
    NO = "no"


class ServiceAreaType(str, Enum):
    SITE_BASED = "site_based"
    CITY = "city"
    COUNTY = "county"
    MULTI_COUNTY = "multi_county"
    CUSTOM = "custom"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_UPDATE = "needs_update"


class Partner(Base):
    """Core Partner Profile - the anchor for all relationships."""

    __tablename__ = "partners"

    # Identity
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    partner_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )  # Human-readable ID like "ARC-001"

    # Basic Info
    organization_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    alternate_names: Mapped[Optional[str]] = mapped_column(Text)
    mission_statement: Mapped[Optional[str]] = mapped_column(Text)
    year_founded: Mapped[Optional[int]] = mapped_column(Integer)
    organization_type: Mapped[OrganizationType] = mapped_column(
        SQLEnum(OrganizationType), default=OrganizationType.NONPROFIT
    )

    # Location - PostGIS Point Geometry
    location: Mapped[Optional[str]] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326)
    )
    physical_address: Mapped[Optional[str]] = mapped_column(Text)
    mailing_address: Mapped[Optional[str]] = mapped_column(Text)
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)

    # Contact Information
    primary_contact_name: Mapped[Optional[str]] = mapped_column(String(255))
    primary_contact_role: Mapped[Optional[str]] = mapped_column(String(100))
    primary_contact_phone: Mapped[Optional[str]] = mapped_column(String(50))
    primary_contact_email: Mapped[Optional[str]] = mapped_column(String(255))
    secondary_contact_name: Mapped[Optional[str]] = mapped_column(String(255))
    secondary_contact_email: Mapped[Optional[str]] = mapped_column(String(255))
    website: Mapped[Optional[str]] = mapped_column(String(500))
    social_media: Mapped[Optional[str]] = mapped_column(Text)  # JSON string

    # Population Served (multi-select stored as array)
    populations_served: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))

    # Geographic Service Area
    geographic_service_area: Mapped[ServiceAreaType] = mapped_column(
        SQLEnum(ServiceAreaType), default=ServiceAreaType.SITE_BASED
    )

    # Physical Capacity
    facility_types: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    approx_square_footage: Mapped[Optional[int]] = mapped_column(Integer)
    ada_accessible: Mapped[AccessibilityLevel] = mapped_column(
        SQLEnum(AccessibilityLevel), default=AccessibilityLevel.NO
    )
    parking_available: Mapped[AccessibilityLevel] = mapped_column(
        SQLEnum(AccessibilityLevel), default=AccessibilityLevel.NO
    )
    transit_access: Mapped[bool] = mapped_column(Boolean, default=False)
    internet_access: Mapped[bool] = mapped_column(Boolean, default=False)
    backup_power: Mapped[Optional[str]] = mapped_column(String(50))  # none/generator/solar/other

    # Languages offered (multi-select)
    languages_offered: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))

    # Status & Metadata
    approval_status: Mapped[ApprovalStatus] = mapped_column(
        SQLEnum(ApprovalStatus), default=ApprovalStatus.PENDING
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    services = relationship("Service", back_populates="partner", cascade="all, delete-orphan")
    service_areas = relationship("ServiceArea", back_populates="partner", cascade="all, delete-orphan")
    metrics = relationship("PartnerMetrics", back_populates="partner", cascade="all, delete-orphan")
    disaster_capabilities = relationship("DisasterCapability", back_populates="partner", cascade="all, delete-orphan")
    disaster_status = relationship("DisasterStatus", back_populates="partner", cascade="all, delete-orphan")
    training = relationship("TrainingReadiness", back_populates="partner", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Partner {self.partner_id}: {self.organization_name}>"
