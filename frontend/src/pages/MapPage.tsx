import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { useQuery } from '@tanstack/react-query'
import { partnersApi, servicesApi } from '../api/client'
import { useAppStore } from '../store/appStore'
import SearchSidebar from '../components/Search/SearchSidebar'
import PartnerPopup from '../components/Map/PartnerPopup'

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const { mode, selectedPartner, setSelectedPartner, sidebarOpen } = useAppStore()

  // Fetch partners GeoJSON
  const { data: partnersGeoJSON } = useQuery({
    queryKey: ['partners', 'geojson'],
    queryFn: partnersApi.getGeoJSON,
  })

  // Fetch service categories
  const { data: categories } = useQuery({
    queryKey: ['services', 'categories'],
    queryFn: servicesApi.getCategories,
  })

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [-98.5795, 39.8283], // US center
      zoom: 4,
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-right')

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Add partners layer when data is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded || !partnersGeoJSON) return

    // Remove existing source/layer if present
    if (map.current.getLayer('partners-layer')) {
      map.current.removeLayer('partners-layer')
    }
    if (map.current.getSource('partners')) {
      map.current.removeSource('partners')
    }

    // Add source
    map.current.addSource('partners', {
      type: 'geojson',
      data: partnersGeoJSON,
    })

    // Add layer
    map.current.addLayer({
      id: 'partners-layer',
      type: 'circle',
      source: 'partners',
      paint: {
        'circle-radius': 8,
        'circle-color': mode === 'disaster' ? '#f97316' : '#ed1c24',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Click handler
    map.current.on('click', 'partners-layer', (e) => {
      if (e.features && e.features[0]) {
        const props = e.features[0].properties
        setSelectedPartner({
          id: props?.id || '',
          partner_id: props?.partner_id || '',
          name: props?.name || '',
          type: props?.type || '',
          address: props?.address || '',
          latitude: 0,
          longitude: 0,
        })
      }
    })

    // Cursor change on hover
    map.current.on('mouseenter', 'partners-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })
    map.current.on('mouseleave', 'partners-layer', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })
  }, [mapLoaded, partnersGeoJSON, mode, setSelectedPartner])

  // Update layer color when mode changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return
    if (map.current.getLayer('partners-layer')) {
      map.current.setPaintProperty(
        'partners-layer',
        'circle-color',
        mode === 'disaster' ? '#f97316' : '#ed1c24'
      )
    }
  }, [mode, mapLoaded])

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <SearchSidebar categories={categories || {}} />
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Mode indicator */}
        <div
          className={`absolute top-4 left-4 px-4 py-2 rounded-lg shadow-lg ${
            mode === 'disaster'
              ? 'bg-orange-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <span className="text-sm font-medium">
            {mode === 'disaster' ? 'Disaster Mode Active' : 'Steady State View'}
          </span>
        </div>

        {/* Partner count */}
        {partnersGeoJSON && (
          <div className="absolute bottom-8 left-4 bg-white px-3 py-2 rounded-lg shadow-lg">
            <span className="text-sm text-gray-600">
              {partnersGeoJSON.features.length} Partners
            </span>
          </div>
        )}

        {/* Selected partner popup */}
        {selectedPartner && (
          <PartnerPopup
            partner={selectedPartner}
            onClose={() => setSelectedPartner(null)}
          />
        )}
      </div>
    </div>
  )
}
