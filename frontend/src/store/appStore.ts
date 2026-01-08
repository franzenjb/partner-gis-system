import { create } from 'zustand'

export type AppMode = 'steady' | 'disaster'

export interface Partner {
  id: string
  partner_id: string
  name: string
  type: string
  address: string
  latitude: number
  longitude: number
  services?: string[]
}

interface AppState {
  // Mode
  mode: AppMode
  setMode: (mode: AppMode) => void

  // Selected partner
  selectedPartner: Partner | null
  setSelectedPartner: (partner: Partner | null) => void

  // Map state
  mapCenter: [number, number]
  setMapCenter: (center: [number, number]) => void
  mapZoom: number
  setMapZoom: (zoom: number) => void

  // Filters
  serviceFilter: string | null
  setServiceFilter: (filter: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  activeLayer: string
  setActiveLayer: (layer: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Mode - default to steady state
  mode: 'steady',
  setMode: (mode) => set({ mode }),

  // Selected partner
  selectedPartner: null,
  setSelectedPartner: (partner) => set({ selectedPartner: partner }),

  // Map state - default to Northern California (Bay Area)
  mapCenter: [-122.2, 37.8],
  setMapCenter: (center) => set({ mapCenter: center }),
  mapZoom: 8,
  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  // Filters
  serviceFilter: null,
  setServiceFilter: (filter) => set({ serviceFilter: filter }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // UI state
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  activeLayer: 'partners',
  setActiveLayer: (layer) => set({ activeLayer: layer }),
}))
