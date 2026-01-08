import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../../api/client'
import { useAppStore } from '../../store/appStore'
import type { ServiceCategory } from '../../types'

interface SearchSidebarProps {
  categories: Record<string, string[]>
}

const CATEGORY_LABELS: Record<string, string> = {
  food_basic_needs: 'Food & Basic Needs',
  health_wellness: 'Health & Wellness',
  housing_stability: 'Housing & Stability',
  economic_social: 'Economic & Social',
  community_resilience: 'Community Resilience',
}

export default function SearchSidebar({ categories }: SearchSidebarProps) {
  const { searchQuery, setSearchQuery, serviceFilter, setServiceFilter } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Search query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchQuery, serviceFilter],
    queryFn: () =>
      searchApi.partners({
        q: searchQuery || undefined,
        service_category: serviceFilter as ServiceCategory | undefined,
        limit: 50,
      }),
    enabled: searchQuery.length > 0 || !!serviceFilter,
  })

  return (
    <div className="p-4">
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search partners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rc-red focus:border-transparent"
        />
      </div>

      {/* Category filters */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Filter by Service</h3>
        <div className="space-y-1">
          {Object.keys(CATEGORY_LABELS).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (selectedCategory === cat) {
                  setSelectedCategory(null)
                  setServiceFilter(null)
                } else {
                  setSelectedCategory(cat)
                  setServiceFilter(cat)
                }
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-rc-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Service type sub-filters */}
      {selectedCategory && categories[selectedCategory] && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase">Service Types</h4>
          <div className="flex flex-wrap gap-1">
            {categories[selectedCategory].map((type) => (
              <span
                key={type}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {type.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          {isLoading ? 'Searching...' : `Results (${searchResults?.count || 0})`}
        </h3>

        {searchResults?.results && searchResults.results.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.results.map((partner) => (
              <div
                key={partner.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <h4 className="font-medium text-gray-800 text-sm">
                  {partner.organization_name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {partner.physical_address || 'No address'}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-rc-red/10 text-rc-red text-xs rounded">
                  {partner.organization_type?.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {searchQuery || serviceFilter
              ? 'No partners found'
              : 'Enter a search term or select a filter'}
          </p>
        )}
      </div>
    </div>
  )
}
