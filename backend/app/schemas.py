"""Pydantic schemas for API request/response validation."""
from datetime import datetime, date
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr

from .models.partner import OrganizationType, AccessibilityLevel, ServiceAreaType, ApprovalStatus
from .models.service import ServiceCategoryType, AccessType
from .models.metrics import MetricType, ReportingFrequency
from .models.disaster import CapabilityType, CapabilityPhase, OperationalStatus
from .models.network import RelationshipType, RelationshipStrength, RelationshipContext


# ============= Partner Schemas =============

class PartnerBase(BaseModel):
    organization_name: str = Field(..., min_length=1, max_length=255)
    alternate_names: Optional[str] = None
    mission_statement: Optional[str] = None
    year_founded: Optional[int] = Field(None, ge=1800, le=2100)
    organization_type: OrganizationType = OrganizationType.NONPROFIT

    physical_address: Optional[str] = None
    mailing_address: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

    primary_contact_name: Optional[str] = None
    primary_contact_role: Optional[str] = None
    primary_contact_phone: Optional[str] = None
    primary_contact_email: Optional[EmailStr] = None
    secondary_contact_name: Optional[str] = None
    secondary_contact_email: Optional[EmailStr] = None
    website: Optional[str] = None
    social_media: Optional[str] = None

    populations_served: Optional[List[str]] = None
    geographic_service_area: ServiceAreaType = ServiceAreaType.SITE_BASED

    facility_types: Optional[List[str]] = None
    approx_square_footage: Optional[int] = None
    ada_accessible: AccessibilityLevel = AccessibilityLevel.NO
    parking_available: AccessibilityLevel = AccessibilityLevel.NO
    transit_access: bool = False
    internet_access: bool = False
    backup_power: Optional[str] = None
    languages_offered: Optional[List[str]] = None


class PartnerCreate(PartnerBase):
    pass


class PartnerUpdate(BaseModel):
    organization_name: Optional[str] = None
    alternate_names: Optional[str] = None
    mission_statement: Optional[str] = None
    year_founded: Optional[int] = None
    organization_type: Optional[OrganizationType] = None
    physical_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    primary_contact_name: Optional[str] = None
    primary_contact_email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class PartnerResponse(PartnerBase):
    id: UUID
    partner_id: str
    approval_status: ApprovalStatus
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PartnerListResponse(BaseModel):
    id: UUID
    partner_id: str
    organization_name: str
    organization_type: OrganizationType
    latitude: Optional[float]
    longitude: Optional[float]
    physical_address: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


# ============= Service Schemas =============

class ServiceBase(BaseModel):
    category: ServiceCategoryType
    service_type: str
    service_name: Optional[str] = None
    description: Optional[str] = None
    days_available: Optional[List[str]] = None
    hours_start: Optional[str] = None
    hours_end: Optional[str] = None
    availability_notes: Optional[str] = None
    access_type: AccessType = AccessType.WALK_IN
    languages_offered: Optional[List[str]] = None
    typical_monthly_volume: Optional[int] = None
    max_daily_capacity: Optional[int] = None


class ServiceCreate(ServiceBase):
    partner_id: UUID


class ServiceResponse(ServiceBase):
    id: UUID
    partner_id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Metrics Schemas =============

class MetricsBase(BaseModel):
    reporting_period_start: date
    reporting_period_end: date
    reporting_frequency: ReportingFrequency = ReportingFrequency.MONTHLY
    metric_type: MetricType
    metric_value: float
    measurement_unit: Optional[str] = None
    metric_description: Optional[str] = None
    program_context: Optional[str] = None
    investment_linked: bool = False
    investment_id: Optional[str] = None
    impact_story: Optional[str] = None
    photo_link: Optional[str] = None


class MetricsCreate(MetricsBase):
    partner_id: UUID


class MetricsResponse(MetricsBase):
    id: UUID
    partner_id: UUID
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Disaster Schemas =============

class DisasterCapabilityBase(BaseModel):
    capability_type: CapabilityType
    capability_phase: CapabilityPhase = CapabilityPhase.BOTH
    description: Optional[str] = None
    staff_capacity: Optional[int] = None
    volunteer_capacity: Optional[int] = None
    space_available_sqft: Optional[int] = None
    max_people_served: Optional[int] = None
    equipment_available: Optional[List[str]] = None
    constraints: Optional[str] = None
    activation_requirements: Optional[str] = None
    lead_time_hours: Optional[int] = None


class DisasterCapabilityCreate(DisasterCapabilityBase):
    partner_id: UUID


class DisasterCapabilityResponse(DisasterCapabilityBase):
    id: UUID
    partner_id: UUID
    is_current: bool
    last_verified: Optional[datetime]

    class Config:
        from_attributes = True


class DisasterStatusBase(BaseModel):
    disaster_event_name: str
    disaster_event_id: Optional[str] = None
    operational_status: OperationalStatus = OperationalStatus.UNKNOWN
    status_notes: Optional[str] = None
    active_services: Optional[List[str]] = None
    surge_capacity_available: Optional[int] = None
    immediate_needs: Optional[List[str]] = None
    needs_description: Optional[str] = None


class DisasterStatusCreate(DisasterStatusBase):
    partner_id: UUID


class DisasterStatusResponse(DisasterStatusBase):
    id: UUID
    partner_id: UUID
    last_updated: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============= Network Schemas =============

class NetworkEdgeBase(BaseModel):
    partner_a_id: UUID
    partner_b_id: UUID
    relationship_type: RelationshipType
    relationship_strength: RelationshipStrength = RelationshipStrength.OCCASIONAL
    relationship_context: RelationshipContext = RelationshipContext.BOTH
    description: Optional[str] = None
    interaction_frequency: Optional[int] = None


class NetworkEdgeCreate(NetworkEdgeBase):
    pass


class NetworkEdgeResponse(NetworkEdgeBase):
    id: UUID
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============= Search & Analysis Schemas =============

class PartnerSearchParams(BaseModel):
    service_category: Optional[ServiceCategoryType] = None
    service_type: Optional[str] = None
    organization_type: Optional[OrganizationType] = None
    languages: Optional[List[str]] = None
    ada_accessible: Optional[bool] = None
    disaster_capable: Optional[bool] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_miles: Optional[float] = Field(None, le=100)
    limit: int = Field(50, le=500)
    offset: int = 0


class NetworkAnalysisResult(BaseModel):
    partner_id: UUID
    partner_name: str
    degree_centrality: float
    betweenness_centrality: float
    eigenvector_centrality: float
    community_id: Optional[int] = None
    is_isolated: bool = False


class GapAnalysisResult(BaseModel):
    area_id: str
    area_name: str
    svi_score: float
    population: int
    service_count: int
    services_per_1000: float
    gap_severity: str  # "high", "medium", "low"
    recommended_services: List[str]


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: dict
    properties: dict


class GeoJSONCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
