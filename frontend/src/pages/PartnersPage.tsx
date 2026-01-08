import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partnersApi, servicesApi } from '../api/client'
import PartnerForm from '../components/Forms/PartnerForm'

export default function PartnersPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)

  // Fetch partners
  const { data: partners, isLoading } = useQuery({
    queryKey: ['partners'],
    queryFn: () => partnersApi.list(),
  })

  // Fetch service categories for the form
  const { data: categories } = useQuery({
    queryKey: ['services', 'categories'],
    queryFn: servicesApi.getCategories,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: partnersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      setShowForm(false)
    },
  })

  // Selected partner details
  const { data: selectedPartner } = useQuery({
    queryKey: ['partner', selectedPartnerId],
    queryFn: () => partnersApi.get(selectedPartnerId!),
    enabled: !!selectedPartnerId,
  })

  const handleCreatePartner = (data: unknown) => {
    createMutation.mutate(data as Record<string, unknown>)
  }

  return (
    <div className="flex h-full">
      {/* Partner list */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Partners</h2>
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 bg-rc-red text-white text-sm font-medium rounded-md hover:bg-rc-red-dark transition-colors"
            >
              + Add Partner
            </button>
          </div>
          <input
            type="text"
            placeholder="Search partners..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rc-red"
          />
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {partners?.map((partner: { id: string; organization_name: string; organization_type?: string; physical_address?: string; is_active: boolean }) => (
              <div
                key={partner.id}
                onClick={() => setSelectedPartnerId(partner.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedPartnerId === partner.id
                    ? 'bg-rc-red/5 border-l-4 border-rc-red'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{partner.organization_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {partner.organization_type?.replace(/_/g, ' ')}
                    </p>
                    {partner.physical_address && (
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-[250px]">
                        {partner.physical_address}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      partner.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {partner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Partner detail / Form */}
      <div className="flex-1 overflow-y-auto">
        {showForm ? (
          <div className="p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Add New Partner</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <PartnerForm
              onSubmit={handleCreatePartner}
              isLoading={createMutation.isPending}
              categories={categories || {}}
            />
          </div>
        ) : selectedPartner ? (
          <div className="p-6">
            <div className="max-w-3xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedPartner.organization_name}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {selectedPartner.partner_id} •{' '}
                    {selectedPartner.organization_type?.replace(/_/g, ' ')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedPartner.approval_status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : selectedPartner.approval_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {selectedPartner.approval_status}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Contact */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                  <dl className="space-y-2 text-sm">
                    {selectedPartner.primary_contact_name && (
                      <div>
                        <dt className="text-gray-500">Primary Contact</dt>
                        <dd className="text-gray-800">{selectedPartner.primary_contact_name}</dd>
                      </div>
                    )}
                    {selectedPartner.primary_contact_email && (
                      <div>
                        <dt className="text-gray-500">Email</dt>
                        <dd>
                          <a
                            href={`mailto:${selectedPartner.primary_contact_email}`}
                            className="text-rc-red hover:underline"
                          >
                            {selectedPartner.primary_contact_email}
                          </a>
                        </dd>
                      </div>
                    )}
                    {selectedPartner.physical_address && (
                      <div>
                        <dt className="text-gray-500">Address</dt>
                        <dd className="text-gray-800">{selectedPartner.physical_address}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Capabilities */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Capabilities</h3>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">ADA Accessible</dt>
                      <dd className="text-gray-800 capitalize">
                        {selectedPartner.ada_accessible || 'Not specified'}
                      </dd>
                    </div>
                    {selectedPartner.languages_offered &&
                      selectedPartner.languages_offered.length > 0 && (
                        <div>
                          <dt className="text-gray-500">Languages</dt>
                          <dd className="text-gray-800">
                            {selectedPartner.languages_offered.join(', ')}
                          </dd>
                        </div>
                      )}
                  </dl>
                </div>
              </div>

              {/* Mission */}
              {selectedPartner.mission_statement && (
                <div className="mt-6 bg-white rounded-lg shadow p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Mission</h3>
                  <p className="text-gray-600">{selectedPartner.mission_statement}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 bg-rc-red text-white rounded-md hover:bg-rc-red-dark transition-colors">
                  Edit Partner
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  View Services
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  Add Metrics
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a partner to view details
          </div>
        )}
      </div>
    </div>
  )
}
