"""Partner Impact Metrics - Layer 4 (Time-Enabled Table)."""
import uuid
from datetime import datetime, date
from enum import Enum
from typing import Optional
from sqlalchemy import String, Text, Integer, Float, Date, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class MetricType(str, Enum):
    CLIENTS_SERVED = "clients_served"
    HOUSEHOLDS_SERVED = "households_served"
    MEALS_SERVED = "meals_served"
    FOOD_POUNDS_DISTRIBUTED = "food_pounds_distributed"
    WORKSHOPS_HELD = "workshops_held"
    WORKSHOP_ATTENDANCE = "workshop_attendance"
    VOLUNTEERS_ENGAGED = "volunteers_engaged"
    FINANCIAL_ASSISTANCE = "financial_assistance"
    GRANTS_DISTRIBUTED = "grants_distributed"
    REFERRALS_MADE = "referrals_made"
    OTHER = "other"


class ReportingFrequency(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    EVENT_BASED = "event_based"
    ANNUAL = "annual"


class PartnerMetrics(Base):
    """Time-series impact metrics for dashboards and reporting."""

    __tablename__ = "partner_metrics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False
    )

    # Time Period
    reporting_period_start: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    reporting_period_end: Mapped[date] = mapped_column(Date, nullable=False)
    reporting_frequency: Mapped[ReportingFrequency] = mapped_column(
        SQLEnum(ReportingFrequency), default=ReportingFrequency.MONTHLY
    )

    # Metric Details
    metric_type: Mapped[MetricType] = mapped_column(SQLEnum(MetricType), nullable=False, index=True)
    metric_value: Mapped[float] = mapped_column(Float, nullable=False)
    measurement_unit: Mapped[Optional[str]] = mapped_column(String(50))  # "people", "pounds", "dollars"
    metric_description: Mapped[Optional[str]] = mapped_column(Text)

    # Context
    program_context: Mapped[Optional[str]] = mapped_column(String(255))  # Which program this relates to
    investment_linked: Mapped[bool] = mapped_column(Boolean, default=False)  # Tied to specific investment?
    investment_id: Mapped[Optional[str]] = mapped_column(String(100))  # Reference to investment if linked

    # Storytelling
    impact_story: Mapped[Optional[str]] = mapped_column(Text)
    photo_link: Mapped[Optional[str]] = mapped_column(String(500))

    # Metadata
    submitted_by: Mapped[Optional[str]] = mapped_column(String(255))
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationship
    partner = relationship("Partner", back_populates="metrics")

    def __repr__(self):
        return f"<Metrics {self.metric_type}: {self.metric_value} for {self.partner_id}>"
