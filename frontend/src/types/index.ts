// Partner types
export interface Partner {
  id: string
  partner_id: string
  organization_name: string
  organization_type: string
  physical_address?: string
  latitude?: number
  longitude?: number
  primary_contact_name?: string
  primary_contact_email?: string
  languages_offered?: string[]
  ada_accessible?: string
  is_active: boolean
  approval_status: string
  created_at: string
  updated_at: string
}

export interface PartnerListItem {
  id: string
  partner_id: string
  organization_name: string
  organization_type: string
  latitude?: number
  longitude?: number
  physical_address?: string
  is_active: boolean
}

// Service types
export type ServiceCategory =
  | 'food_basic_needs'
  | 'health_wellness'
  | 'housing_stability'
  | 'economic_social'
  | 'community_resilience'

export interface Service {
  id: string
  partner_id: string
  category: ServiceCategory
  service_type: string
  service_name?: string
  description?: string
  access_type: string
  languages_offered?: string[]
  is_active: boolean
}

// Metrics types
export type MetricType =
  | 'clients_served'
  | 'households_served'
  | 'meals_served'
  | 'food_pounds_distributed'
  | 'workshops_held'
  | 'workshop_attendance'
  | 'volunteers_engaged'
  | 'financial_assistance'
  | 'grants_distributed'
  | 'referrals_made'
  | 'other'

export interface PartnerMetrics {
  id: string
  partner_id: string
  reporting_period_start: string
  reporting_period_end: string
  metric_type: MetricType
  metric_value: number
  measurement_unit?: string
  verified: boolean
}

// Network types
export interface NetworkEdge {
  id: string
  partner_a_id: string
  partner_b_id: string
  relationship_type: string
  relationship_strength: string
  relationship_context: string
}

export interface NetworkNode {
  data: {
    id: string
    label: string
    type: string
    partner_id: string
  }
}

export interface NetworkGraph {
  nodes: NetworkNode[]
  edges: Array<{
    data: {
      id: string
      source: string
      target: string
      relationship: string
      strength: string
    }
  }>
}

export interface NetworkAnalysis {
  partner_id: string
  partner_name: string
  degree_centrality: number
  betweenness_centrality: number
  eigenvector_centrality: number
  community_id?: number
  is_isolated: boolean
}

// Disaster types
export interface DisasterCapability {
  id: string
  partner_id: string
  capability_type: string
  capability_phase: string
  staff_capacity?: number
  volunteer_capacity?: number
  is_current: boolean
}

export interface DisasterStatus {
  id: string
  partner_id: string
  disaster_event_name: string
  operational_status: string
  active_services?: string[]
  last_updated: string
}

// GeoJSON types
export interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'Point' | 'Polygon' | 'MultiPolygon'
    coordinates: number[] | number[][] | number[][][]
  }
  properties: Record<string, unknown>
}

export interface GeoJSONCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

// Search types
export interface SearchParams {
  q?: string
  service_category?: ServiceCategory
  service_type?: string
  organization_type?: string
  languages?: string[]
  ada_accessible?: boolean
  lat?: number
  lng?: number
  radius_miles?: number
  limit?: number
  offset?: number
}

export interface SearchResult {
  count: number
  offset: number
  limit: number
  results: PartnerListItem[]
}
