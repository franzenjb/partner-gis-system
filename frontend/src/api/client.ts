import axios from 'axios'
import type {
  Partner,
  PartnerListItem,
  Service,
  PartnerMetrics,
  NetworkGraph,
  NetworkAnalysis,
  DisasterCapability,
  DisasterStatus,
  GeoJSONCollection,
  SearchParams,
  SearchResult,
} from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Partners
export const partnersApi = {
  list: async (activeOnly = true): Promise<PartnerListItem[]> => {
    const { data } = await api.get('/partners', { params: { active_only: activeOnly } })
    return data
  },

  getGeoJSON: async (): Promise<GeoJSONCollection> => {
    const { data } = await api.get('/partners/geojson')
    return data
  },

  get: async (id: string): Promise<Partner> => {
    const { data } = await api.get(`/partners/${id}`)
    return data
  },

  create: async (partner: Partial<Partner>): Promise<Partner> => {
    const { data } = await api.post('/partners', partner)
    return data
  },

  update: async (id: string, partner: Partial<Partner>): Promise<Partner> => {
    const { data } = await api.put(`/partners/${id}`, partner)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/partners/${id}`)
  },

  approve: async (id: string): Promise<void> => {
    await api.post(`/partners/${id}/approve`)
  },
}

// Services
export const servicesApi = {
  list: async (partnerId?: string): Promise<Service[]> => {
    const params = partnerId ? { partner_id: partnerId } : {}
    const { data } = await api.get('/services', { params })
    return data
  },

  getCategories: async (): Promise<Record<string, string[]>> => {
    const { data } = await api.get('/services/categories')
    return data
  },

  create: async (service: Partial<Service>): Promise<Service> => {
    const { data } = await api.post('/services', service)
    return data
  },
}

// Metrics
export const metricsApi = {
  list: async (partnerId?: string): Promise<PartnerMetrics[]> => {
    const params = partnerId ? { partner_id: partnerId } : {}
    const { data } = await api.get('/metrics', { params })
    return data
  },

  getSummary: async (partnerId?: string): Promise<Record<string, { total: number; count: number; average: number }>> => {
    const params = partnerId ? { partner_id: partnerId } : {}
    const { data } = await api.get('/metrics/summary', { params })
    return data
  },

  getTimeseries: async (metricType: string, partnerId?: string) => {
    const params: Record<string, string> = { metric_type: metricType }
    if (partnerId) params.partner_id = partnerId
    const { data } = await api.get('/metrics/timeseries', { params })
    return data
  },

  create: async (metrics: Partial<PartnerMetrics>): Promise<PartnerMetrics> => {
    const { data } = await api.post('/metrics', metrics)
    return data
  },
}

// Network
export const networkApi = {
  getGraph: async (context?: string): Promise<NetworkGraph> => {
    const params = context ? { context } : {}
    const { data } = await api.get('/network/graph', { params })
    return data
  },

  getAnalysis: async (context?: string): Promise<{
    node_analysis: NetworkAnalysis[]
    network_metrics: Record<string, number>
    communities: Array<{ id: number; members: string[]; size: number }>
    isolated_nodes: NetworkAnalysis[]
    key_bridges: NetworkAnalysis[]
  }> => {
    const params = context ? { context } : {}
    const { data } = await api.get('/network/analysis', { params })
    return data
  },

  getPartnerConnections: async (partnerId: string) => {
    const { data } = await api.get(`/network/partner/${partnerId}/connections`)
    return data
  },

  createEdge: async (edge: Partial<NetworkGraph['edges'][0]['data']>) => {
    const { data } = await api.post('/network/edges', edge)
    return data
  },
}

// Disaster
export const disasterApi = {
  getCapabilities: async (partnerId?: string): Promise<DisasterCapability[]> => {
    const params = partnerId ? { partner_id: partnerId } : {}
    const { data } = await api.get('/disaster/capabilities', { params })
    return data
  },

  getCapabilitiesSummary: async () => {
    const { data } = await api.get('/disaster/capabilities/summary')
    return data
  },

  getStatus: async (eventName?: string): Promise<DisasterStatus[]> => {
    const params = eventName ? { event_name: eventName } : {}
    const { data } = await api.get('/disaster/status', { params })
    return data
  },

  getActiveEvents: async (): Promise<{ active_events: string[] }> => {
    const { data } = await api.get('/disaster/status/events')
    return data
  },

  getDashboard: async (eventName?: string) => {
    const params = eventName ? { event_name: eventName } : {}
    const { data } = await api.get('/disaster/dashboard', { params })
    return data
  },

  createStatus: async (status: Partial<DisasterStatus>): Promise<DisasterStatus> => {
    const { data } = await api.post('/disaster/status', status)
    return data
  },
}

// Search
export const searchApi = {
  partners: async (params: SearchParams): Promise<SearchResult> => {
    const { data } = await api.get('/search/partners', { params })
    return data
  },

  nearby: async (lat: number, lng: number, radiusMiles = 5) => {
    const { data } = await api.get('/search/nearby', {
      params: { lat, lng, radius_miles: radiusMiles },
    })
    return data
  },

  services: async (params: SearchParams) => {
    const { data } = await api.get('/search/services', { params })
    return data
  },
}

// Analysis
export const analysisApi = {
  getCoverage: async () => {
    const { data } = await api.get('/analysis/coverage')
    return data
  },

  getGaps: async () => {
    const { data } = await api.get('/analysis/gaps')
    return data
  },

  getEquity: async () => {
    const { data } = await api.get('/analysis/equity')
    return data
  },

  getImpactSummary: async (partnerId?: string) => {
    const params = partnerId ? { partner_id: partnerId } : {}
    const { data } = await api.get('/analysis/impact-summary', { params })
    return data
  },

  getReadinessScore: async (partnerId?: string) => {
    const params = partnerId ? { partner_id: partnerId } : {}
    const { data } = await api.get('/analysis/readiness-score', { params })
    return data
  },

  aiSummarize: async (prompt: string, partnerId?: string) => {
    const { data } = await api.post('/analysis/ai/summarize', null, {
      params: { prompt, partner_id: partnerId },
    })
    return data
  },
}

export default api
