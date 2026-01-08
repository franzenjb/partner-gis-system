"""Day-to-Day Services & Programs - Layer 2."""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional, List
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class ServiceCategoryType(str, Enum):
    FOOD_BASIC_NEEDS = "food_basic_needs"
    HEALTH_WELLNESS = "health_wellness"
    HOUSING_STABILITY = "housing_stability"
    ECONOMIC_SOCIAL = "economic_social"
    COMMUNITY_RESILIENCE = "community_resilience"


class AccessType(str, Enum):
    WALK_IN = "walk_in"
    APPOINTMENT = "appointment"
    REFERRAL = "referral"
    HYBRID = "hybrid"


class ServiceCategory(Base):
    """Reference table for service categories and types."""

    __tablename__ = "service_categories"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[ServiceCategoryType] = mapped_column(SQLEnum(ServiceCategoryType), nullable=False)
    service_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    icon: Mapped[Optional[str]] = mapped_column(String(50))  # Icon name for UI

    __table_args__ = (
        {"comment": "Reference table for all service types"},
    )


# Predefined service types
SERVICE_TYPES = {
    ServiceCategoryType.FOOD_BASIC_NEEDS: [
        "food_pantry",
        "hot_meals",
        "grocery_vouchers",
        "produce_distribution",
        "refrigerated_storage",
        "clothing",
        "hygiene_kits",
    ],
    ServiceCategoryType.HEALTH_WELLNESS: [
        "mental_health_support",
        "case_management",
        "health_screenings",
        "first_aid",
        "substance_use_support",
        "peer_support_groups",
    ],
    ServiceCategoryType.HOUSING_STABILITY: [
        "rental_assistance",
        "utility_assistance",
        "navigation_services",
        "homeless_outreach",
        "shelter_referral",
    ],
    ServiceCategoryType.ECONOMIC_SOCIAL: [
        "computer_access",
        "job_readiness",
        "benefits_enrollment",
        "financial_coaching",
        "workshops_trainings",
        "language_support",
    ],
    ServiceCategoryType.COMMUNITY_RESILIENCE: [
        "cooling_warming_space",
        "charging_station",
        "information_hub",
        "volunteer_coordination",
    ],
}


class Service(Base):
    """Partner services - what they offer day-to-day."""

    __tablename__ = "partner_services"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False
    )

    # Service Details
    category: Mapped[ServiceCategoryType] = mapped_column(
        SQLEnum(ServiceCategoryType), nullable=False, index=True
    )
    service_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    service_name: Mapped[Optional[str]] = mapped_column(String(255))  # Custom name if any
    description: Mapped[Optional[str]] = mapped_column(Text)

    # Availability
    days_available: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))  # ["monday", "tuesday", ...]
    hours_start: Mapped[Optional[str]] = mapped_column(String(10))  # "09:00"
    hours_end: Mapped[Optional[str]] = mapped_column(String(10))  # "17:00"
    availability_notes: Mapped[Optional[str]] = mapped_column(Text)

    # Access
    access_type: Mapped[AccessType] = mapped_column(
        SQLEnum(AccessType), default=AccessType.WALK_IN
    )
    languages_offered: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))

    # Capacity
    typical_monthly_volume: Mapped[Optional[int]] = mapped_column(Integer)
    max_daily_capacity: Mapped[Optional[int]] = mapped_column(Integer)

    # Status
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationship
    partner = relationship("Partner", back_populates="services")

    def __repr__(self):
        return f"<Service {self.service_type} for Partner {self.partner_id}>"
