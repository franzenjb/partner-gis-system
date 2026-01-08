"""Partner Core Profile - Layer 1 (Primary Point Feature Layer)."""
import uuid
import os
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import String, Text, Boolean, Integer, Float, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base

# Check if using PostgreSQL
IS_POSTGRES = "postgresql" in os.getenv("DATABASE_URL", "sqlite")


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

    # Identity - use String for SQLite compatibility
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    partner_id: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )  # Human-readable ID like "ARC-001"

    # Basic Info
    organization_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    alternate_names: Mapped[Optional[str]] = mapped_column(Text)
    mission_statement: Mapped[Optional[str]] = mapped_column(Text)
    year_founded: Mapped[Optional[int]] = mapped_column(Integer)
    organization_type: Mapped[str] = mapped_column(
        String(50), default="nonprofit"
    )

    # Location - simple lat/lng (no PostGIS for SQLite compatibility)
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

    # Population Served (JSON string for SQLite compatibility)
    populations_served: Mapped[Optional[str]] = mapped_column(Text)  # JSON array

    # Geographic Service Area
    geographic_service_area: Mapped[str] = mapped_column(
        String(50), default="site_based"
    )

    # Physical Capacity
    facility_types: Mapped[Optional[str]] = mapped_column(Text)  # JSON array
    approx_square_footage: Mapped[Optional[int]] = mapped_column(Integer)
    ada_accessible: Mapped[str] = mapped_column(String(20), default="no")
    parking_available: Mapped[str] = mapped_column(String(20), default="no")
    transit_access: Mapped[bool] = mapped_column(Boolean, default=False)
    internet_access: Mapped[bool] = mapped_column(Boolean, default=False)
    backup_power: Mapped[Optional[str]] = mapped_column(String(50))

    # Languages offered (JSON string for SQLite)
    languages_offered: Mapped[Optional[str]] = mapped_column(Text)  # JSON array

    # Status & Metadata
    approval_status: Mapped[str] = mapped_column(String(20), default="pending")
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
