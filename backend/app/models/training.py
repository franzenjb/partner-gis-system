"""Training, Readiness & Gaps - Layer 7."""
import uuid
from datetime import datetime, date
from enum import Enum
from typing import Optional, List
from sqlalchemy import String, Text, Date, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class TrainingType(str, Enum):
    DISASTER_RESPONSE_BASICS = "disaster_response_basics"
    SHELTER_OPERATIONS = "shelter_operations"
    FEEDING_OPERATIONS = "feeding_operations"
    PSYCHOLOGICAL_FIRST_AID = "psychological_first_aid"
    DISASTER_CASE_MANAGEMENT = "disaster_case_management"
    VOAD_COORDINATION = "voad_coordination"
    SAFETY_BACKGROUNDING = "safety_backgrounding"
    OTHER = "other"


class TrainingFormat(str, Enum):
    IN_PERSON = "in_person"
    VIRTUAL = "virtual"
    JUST_IN_TIME = "just_in_time"
    HYBRID = "hybrid"


class GapType(str, Enum):
    STAFFING = "staffing"
    SPACE = "space"
    EQUIPMENT = "equipment"
    POLICY_INSURANCE = "policy_insurance"
    COORDINATION = "coordination"
    TRAINING = "training"
    FUNDING = "funding"
    OTHER = "other"


class TrainingReadiness(Base):
    """Layer 7: Training completion, interests, and identified gaps."""

    __tablename__ = "training_readiness"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False
    )

    # Training Completed
    trainings_completed: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    training_completion_dates: Mapped[Optional[str]] = mapped_column(Text)  # JSON mapping type->date
    certifications: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))

    # Training Interest
    interested_in_training: Mapped[bool] = mapped_column(Boolean, default=False)
    priority_training_areas: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    preferred_format: Mapped[TrainingFormat] = mapped_column(
        SQLEnum(TrainingFormat), default=TrainingFormat.HYBRID
    )
    training_notes: Mapped[Optional[str]] = mapped_column(Text)

    # Self-Identified Gaps
    capacity_gaps: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))
    gap_descriptions: Mapped[Optional[str]] = mapped_column(Text)
    priority_needs: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String))

    # Readiness Assessment
    overall_readiness_score: Mapped[Optional[int]] = mapped_column()  # 1-10 self-assessment
    last_readiness_assessment: Mapped[Optional[date]] = mapped_column(Date)

    # Metadata
    assessed_by: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationship
    partner = relationship("Partner", back_populates="training")

    def __repr__(self):
        return f"<TrainingReadiness for {self.partner_id}>"
