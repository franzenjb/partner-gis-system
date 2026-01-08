/**
 * API Client - Uses mock data for demo, real API when backend is available
 */
import {
  mockPartners,
  mockServices,
  mockPartnersGeoJSON,
  mockServiceCategories,
  mockMetricsSummary,
  mockNetworkAnalysis,
  mockNetworkEdges,
  mockDisasterDashboard,
  mockCoverage,
  mockEquity,
  mockReadiness,
} from './mockData'

// Demo mode - use mock data (for GitHub Pages)
const USE_MOCK_DATA = true

// Partners
export const partnersApi = {
  list: async () => {
    if (USE_MOCK_DATA) return mockPartners
    const res = await fetch('/api/partners')
    return res.json()
  },

  getGeoJSON: async () => {
    if (USE_MOCK_DATA) return mockPartnersGeoJSON
    const res = await fetch('/api/partners/geojson')
    return res.json()
  },

  get: async (id: string) => {
    if (USE_MOCK_DATA) {
      const partner = mockPartners.find((p) => p.id === id)
      return partner || mockPartners[0]
    }
    const res = await fetch(`/api/partners/${id}`)
    return res.json()
  },

  create: async (partner: Record<string, unknown>) => {
    if (USE_MOCK_DATA) {
      console.log('Mock create partner:', partner)
      return { ...partner, id: String(Date.now()), partner_id: `PTR-${Date.now()}` }
    }
    const res = await fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partner),
    })
    return res.json()
  },

  update: async (id: string, partner: Record<string, unknown>) => {
    if (USE_MOCK_DATA) {
      console.log('Mock update partner:', id, partner)
      return partner
    }
    const res = await fetch(`/api/partners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partner),
    })
    return res.json()
  },

  delete: async (id: string) => {
    if (USE_MOCK_DATA) {
      console.log('Mock delete partner:', id)
      return
    }
    await fetch(`/api/partners/${id}`, { method: 'DELETE' })
  },

  approve: async (id: string) => {
    if (USE_MOCK_DATA) {
      console.log('Mock approve partner:', id)
      return
    }
    await fetch(`/api/partners/${id}/approve`, { method: 'POST' })
  },
}

// Services
export const servicesApi = {
  list: async (partnerId?: string) => {
    if (USE_MOCK_DATA) {
      if (partnerId) {
        return mockServices.filter((s) => s.partner_id === partnerId)
      }
      return mockServices
    }
    const params = partnerId ? `?partner_id=${partnerId}` : ''
    const res = await fetch(`/api/services${params}`)
    return res.json()
  },

  getCategories: async () => {
    if (USE_MOCK_DATA) return mockServiceCategories
    const res = await fetch('/api/services/categories')
    return res.json()
  },

  create: async (service: Record<string, unknown>) => {
    if (USE_MOCK_DATA) {
      console.log('Mock create service:', service)
      return service
    }
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service),
    })
    return res.json()
  },
}

// Metrics
export const metricsApi = {
  list: async () => {
    if (USE_MOCK_DATA) return []
    const res = await fetch('/api/metrics')
    return res.json()
  },

  getSummary: async () => {
    if (USE_MOCK_DATA) return mockMetricsSummary
    const res = await fetch('/api/metrics/summary')
    return res.json()
  },

  getTimeseries: async () => {
    if (USE_MOCK_DATA) return []
    const res = await fetch('/api/metrics/timeseries')
    return res.json()
  },

  create: async (metrics: Record<string, unknown>) => {
    if (USE_MOCK_DATA) {
      console.log('Mock create metrics:', metrics)
      return metrics
    }
    const res = await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    })
    return res.json()
  },
}

// Network
export const networkApi = {
  getGraph: async () => {
    if (USE_MOCK_DATA) {
      return {
        nodes: mockPartners.map((p) => ({
          data: {
            id: p.id,
            label: p.organization_name,
            type: p.organization_type,
            partner_id: p.partner_id,
          },
        })),
        edges: mockNetworkEdges.map((e) => ({
          data: {
            id: e.id,
            source: e.partner_a_id,
            target: e.partner_b_id,
            relationship: e.relationship_type,
            strength: e.relationship_strength,
            context: e.relationship_context,
          },
        })),
        summary: {
          total_nodes: mockPartners.length,
          total_edges: mockNetworkEdges.length,
        },
      }
    }
    const res = await fetch('/api/network/graph')
    return res.json()
  },

  getAnalysis: async () => {
    if (USE_MOCK_DATA) return mockNetworkAnalysis
    const res = await fetch('/api/network/analysis')
    return res.json()
  },

  getPartnerConnections: async (partnerId: string) => {
    if (USE_MOCK_DATA) {
      const connections = mockNetworkEdges.filter(
        (e) => e.partner_a_id === partnerId || e.partner_b_id === partnerId
      )
      return {
        partner_id: partnerId,
        total_connections: connections.length,
        connections,
      }
    }
    const res = await fetch(`/api/network/partner/${partnerId}/connections`)
    return res.json()
  },

  createEdge: async (edge: Record<string, unknown>) => {
    if (USE_MOCK_DATA) {
      console.log('Mock create edge:', edge)
      return edge
    }
    const res = await fetch('/api/network/edges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edge),
    })
    return res.json()
  },
}

// Disaster
export const disasterApi = {
  getCapabilities: async () => {
    if (USE_MOCK_DATA) return []
    const res = await fetch('/api/disaster/capabilities')
    return res.json()
  },

  getCapabilitiesSummary: async () => {
    if (USE_MOCK_DATA) return mockDisasterDashboard.capabilities_by_type
    const res = await fetch('/api/disaster/capabilities/summary')
    return res.json()
  },

  getStatus: async () => {
    if (USE_MOCK_DATA) return []
    const res = await fetch('/api/disaster/status')
    return res.json()
  },

  getActiveEvents: async () => {
    if (USE_MOCK_DATA) return { active_events: ['2024 Wildfire Season'] }
    const res = await fetch('/api/disaster/status/events')
    return res.json()
  },

  getDashboard: async () => {
    if (USE_MOCK_DATA) return mockDisasterDashboard
    const res = await fetch('/api/disaster/dashboard')
    return res.json()
  },

  createStatus: async (status: Record<string, unknown>) => {
    if (USE_MOCK_DATA) {
      console.log('Mock create status:', status)
      return status
    }
    const res = await fetch('/api/disaster/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status),
    })
    return res.json()
  },
}

// Search
export const searchApi = {
  partners: async (params: { q?: string; service_category?: string }) => {
    if (USE_MOCK_DATA) {
      let results = [...mockPartners]
      if (params.q) {
        const q = params.q.toLowerCase()
        results = results.filter(
          (p) =>
            p.organization_name.toLowerCase().includes(q) ||
            p.physical_address?.toLowerCase().includes(q)
        )
      }
      if (params.service_category) {
        const partnerIds = mockServices
          .filter((s) => s.category === params.service_category)
          .map((s) => s.partner_id)
        results = results.filter((p) => partnerIds.includes(p.id))
      }
      return {
        count: results.length,
        offset: 0,
        limit: 50,
        results,
      }
    }
    const res = await fetch('/api/search/partners?' + new URLSearchParams(params as Record<string, string>))
    return res.json()
  },

  nearby: async (lat: number, lng: number, radiusMiles = 5) => {
    if (USE_MOCK_DATA) {
      // Simple distance filter
      const results = mockPartners.filter((p) => {
        if (!p.latitude || !p.longitude) return false
        const dist = Math.sqrt(Math.pow(p.latitude - lat, 2) + Math.pow(p.longitude - lng, 2))
        return dist < radiusMiles / 50 // Rough approximation
      })
      return {
        search_location: { lat, lng },
        radius_miles: radiusMiles,
        count: results.length,
        results,
      }
    }
    const res = await fetch(`/api/search/nearby?lat=${lat}&lng=${lng}&radius_miles=${radiusMiles}`)
    return res.json()
  },

  services: async () => {
    if (USE_MOCK_DATA) return { count: mockServices.length, results: mockServices }
    const res = await fetch('/api/search/services')
    return res.json()
  },
}

// Analysis
export const analysisApi = {
  getCoverage: async () => {
    if (USE_MOCK_DATA) return mockCoverage
    const res = await fetch('/api/analysis/coverage')
    return res.json()
  },

  getGaps: async () => {
    if (USE_MOCK_DATA) {
      return {
        analysis_type: 'service_gap_analysis',
        sample_gaps: [
          {
            area_name: 'East Oakland',
            svi_score: 0.82,
            gap_severity: 'high',
            missing_services: ['mental_health_support', 'utility_assistance'],
          },
          {
            area_name: 'North Bay Rural',
            svi_score: 0.65,
            gap_severity: 'medium',
            missing_services: ['food_pantry', 'transportation'],
          },
        ],
      }
    }
    const res = await fetch('/api/analysis/gaps')
    return res.json()
  },

  getEquity: async () => {
    if (USE_MOCK_DATA) return mockEquity
    const res = await fetch('/api/analysis/equity')
    return res.json()
  },

  getImpactSummary: async () => {
    if (USE_MOCK_DATA) return { metrics: mockMetricsSummary }
    const res = await fetch('/api/analysis/impact-summary')
    return res.json()
  },

  getReadinessScore: async () => {
    if (USE_MOCK_DATA) return mockReadiness
    const res = await fetch('/api/analysis/readiness-score')
    return res.json()
  },

  aiSummarize: async (prompt: string) => {
    if (USE_MOCK_DATA) {
      return {
        summary: `AI Summary (Demo Mode): Based on the Northern California partner network of ${mockPartners.length} organizations, the network shows strong disaster coordination capabilities. Key insights: The Bay Area Disaster Relief Coalition serves as a critical hub with highest betweenness centrality. Recommendations include expanding services in high-SVI areas of East Oakland and increasing mental health support in fire-affected North Bay regions.`,
        context_used: prompt,
      }
    }
    const res = await fetch('/api/analysis/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    return res.json()
  },
}
