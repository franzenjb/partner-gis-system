import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partnersApi, analysisApi } from '../api/client'

export default function AdminPage() {
  const queryClient = useQueryClient()

  // Fetch partners needing approval
  const { data: partners } = useQuery({
    queryKey: ['partners', 'all'],
    queryFn: () => partnersApi.list(),
  })

  // Fetch readiness score
  const { data: readiness } = useQuery({
    queryKey: ['analysis', 'readiness'],
    queryFn: () => analysisApi.getReadinessScore(),
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: partnersApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
    },
  })

  const pendingPartners = partners?.filter(
    (p: { is_active: boolean; organization_type: string }) => !p.is_active || p.organization_type === 'pending'
  )

  return (
    <div className="p-6 overflow-y-auto h-full bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Pending Approvals</h2>
              <p className="text-sm text-gray-500 mt-1">
                Partners awaiting review and approval
              </p>
            </div>
            <div className="p-4">
              {pendingPartners && pendingPartners.length > 0 ? (
                <div className="space-y-3">
                  {pendingPartners.map((partner: { id: string; organization_name: string; organization_type?: string }) => (
                    <div
                      key={partner.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {partner.organization_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {partner.organization_type?.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveMutation.mutate(partner.id)}
                          className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors">
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No pending approvals</p>
              )}
            </div>
          </div>

          {/* Network Readiness */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Network Readiness</h2>
              <p className="text-sm text-gray-500 mt-1">Overall disaster preparedness</p>
            </div>
            <div className="p-4">
              {readiness?.network_readiness ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total Partners</span>
                    <span className="font-semibold text-gray-800">
                      {readiness.network_readiness.total_partners}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Disaster Capabilities</span>
                    <span className="font-semibold text-gray-800">
                      {readiness.network_readiness.total_disaster_capabilities}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-600">Avg Capabilities/Partner</span>
                    <span className="font-semibold text-green-700">
                      {readiness.network_readiness.average_capabilities_per_partner}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Loading readiness data...</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-rc-red/5 hover:bg-rc-red/10 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-rc-red rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-800">Add Partner</h3>
                  <p className="text-sm text-gray-500">Register a new partner</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-800">Import Data</h3>
                  <p className="text-sm text-gray-500">Bulk import from CSV</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-800">Activate Disaster Mode</h3>
                  <p className="text-sm text-gray-500">Start disaster response tracking</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-800">Generate Report</h3>
                  <p className="text-sm text-gray-500">Export impact data</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {[
                  { action: 'Partner approved', target: 'Community Food Bank', time: '2 hours ago' },
                  { action: 'Metrics submitted', target: 'Faith Center', time: '5 hours ago' },
                  { action: 'New registration', target: 'Hope Shelter', time: '1 day ago' },
                  { action: 'Status updated', target: 'Regional Hub', time: '2 days ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-rc-red rounded-full mt-2" />
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{activity.action}</span> - {activity.target}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
