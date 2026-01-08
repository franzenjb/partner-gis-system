"""Disaster Response & Recovery - Layers 5 and 6."""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class CapabilityPhase(str, Enum):
    RESPONSE = "response"
    RECOVERY = "recovery"
    BOTH = "both"


class CapabilityType(str, Enum):
    # Response capabilities
    FEEDING_SUPPORT = "feeding_support"
    MASS_CARE_SHELTERING = "mass_care_sheltering"
    EMERGENCY_SUPPLIES = "emergency_supplies"
    MENTAL_HEALTH_SPIRITUAL = "mental_health_spiritual"
    CASE_MANAGEMENT = "case_management"
    INFORMATION_REFERRAL = "information_referral"
    DAMAGE_ASSESSMENT = "damage_assessment"
    VOLUNTEER_STAGING = "volunteer_staging"
    SPACE_FOR_OPERATIONS = "space_for_operations"
    # Recovery capabilities
    LONG_TERM_CASEWORK = "long_term_casework"
    FINANCIAL_ASSISTANCE = "financial_assistance"
    REPAIR_REBUILD = "repair_rebuild"
    HOUSING_NAVIGATION = "housing_navigation"
    COMMUNITY_OUTREACH = "community_outreach"
    DRC_HOSTING = "disaster_recovery_center_hosting"


class OperationalStatus(str, Enum):
    OPERATIONAL = "operational"
    LIMITED = "limited"
    NOT_OPERATIONAL = "not_operational"
    UNKNOWN = "unknown"


class DisasterCapability(Base):
    """Layer 5: Partner disaster response/recovery capabilities."""

    __tablename__ = "disaster_capabilities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False
    )

    # Capability
    capability_type: Mapped[CapabilityType] = mapped_column(
        SQLEnum(CapabilityType), nullable=False, index=True
    )
    capability_phase: Mapped[CapabilityPhase] = mapped_column(
        SQLEnum(CapabilityPhase), default=CapabilityPhase.BOTH
    )
    description: Mapped[Optional[str]] = mapped_column(Text)

    # Capacity
    staff_capacity: Mapped[Optional[int]] = mapped_column(Integer)
    volunteer_capacity: Mapped[Optional[int]] = mapped_column(Integer)
    space_available_sqft: Mapped[Optional[int]] = mapped_column(Integer)
    max_people_served: Mapped[Optional[int]] = mapped_column(Integer)

    # Equipment
    equipment_available: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))

    # Constraints
    constraints: Mapped[Optional[str]] = mapped_column(Text)  # Limitations, requirements
    activation_requirements: Mapped[Optional[str]] = mapped_column(Text)
    lead_time_hours: Mapped[Optional[int]] = mapped_column(Integer)  # How long to activate

    # Status
    is_current: Mapped[bool] = mapped_column(Boolean, default=True)
    last_verified: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationship
    partner = relationship("Partner", back_populates="disaster_capabilities")

    def __repr__(self):
        return f"<DisasterCapability {self.capability_type} for {self.partner_id}>"


class DisasterStatus(Base):
    """Layer 6: Real-time disaster operational status (event-based)."""

    __tablename__ = "disaster_status"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False
    )

    # Event Context
    disaster_event_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    disaster_event_id: Mapped[Optional[str]] = mapped_column(String(100))  # External event ID if any

    # Status
    operational_status: Mapped[OperationalStatus] = mapped_column(
        SQLEnum(OperationalStatus), default=OperationalStatus.UNKNOWN
    )
    status_notes: Mapped[Optional[str]] = mapped_column(Text)

    # Active Services During Event
    active_services: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    surge_capacity_available: Mapped[Optional[int]] = mapped_column(Integer)

    # Needs
    immediate_needs: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    needs_description: Mapped[Optional[str]] = mapped_column(Text)

    # Timestamps
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime)  # Auto-expire old statuses
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship
    partner = relationship("Partner", back_populates="disaster_status")

    def __repr__(self):
        return f"<DisasterStatus {self.disaster_event_name}: {self.operational_status}>"
