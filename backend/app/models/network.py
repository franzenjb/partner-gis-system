"""Partner Network & Collaboration - Layer 8 (Relationship/Graph Table)."""
import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class RelationshipType(str, Enum):
    REFERRALS_SEND = "referrals_send"
    REFERRALS_RECEIVE = "referrals_receive"
    CO_LOCATED = "co_located"
    SHARED_SPACE = "shared_space"
    SHARED_VOLUNTEERS = "shared_volunteers"
    SHARED_FUNDING = "shared_funding"
    JOINT_PROGRAMS = "joint_programs"
    INFORMATION_SHARING = "information_sharing"
    DISASTER_COORDINATION = "disaster_coordination"
    BACKBONE_FISCAL = "backbone_fiscal_sponsor"
    TRAINING_PROVIDER = "training_provider"
    TRAINING_RECIPIENT = "training_recipient"


class RelationshipStrength(str, Enum):
    STRONG = "strong"  # Ongoing, deep collaboration
    OCCASIONAL = "occasional"  # Regular but not constant
    EMERGING = "emerging"  # New or developing
    LIMITED = "limited"  # One-time or minimal
    ASPIRATIONAL = "aspirational"  # Desired but not yet established


class RelationshipContext(str, Enum):
    STEADY_STATE = "steady_state"
    DISASTER = "disaster"
    BOTH = "both"


class PartnerNetwork(Base):
    """
    Graph edges representing relationships between partners.

    This table supports network analysis:
    - Centrality metrics (degree, betweenness, eigenvector)
    - Community detection
    - Path analysis
    - Connectivity assessment
    """

    __tablename__ = "partner_network"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Edge: Partner A -> Partner B
    partner_a_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False, index=True
    )
    partner_b_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Relationship Details
    relationship_type: Mapped[RelationshipType] = mapped_column(
        SQLEnum(RelationshipType), nullable=False, index=True
    )
    relationship_strength: Mapped[RelationshipStrength] = mapped_column(
        SQLEnum(RelationshipStrength), default=RelationshipStrength.OCCASIONAL
    )
    relationship_context: Mapped[RelationshipContext] = mapped_column(
        SQLEnum(RelationshipContext), default=RelationshipContext.BOTH
    )

    # Additional Context
    description: Mapped[Optional[str]] = mapped_column(Text)
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # For weighted analysis
    interaction_frequency: Mapped[Optional[int]] = mapped_column()  # Times per year
    last_interaction: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Metadata
    reported_by: Mapped[Optional[str]] = mapped_column(String(255))  # Which partner reported this
    verified: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Prevent duplicate edges (A-B with same relationship type)
    __table_args__ = (
        UniqueConstraint(
            "partner_a_id", "partner_b_id", "relationship_type",
            name="unique_partner_relationship"
        ),
    )

    def __repr__(self):
        return f"<Network {self.partner_a_id} --[{self.relationship_type}]--> {self.partner_b_id}>"
