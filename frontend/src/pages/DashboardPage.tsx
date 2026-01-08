import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { analysisApi, metricsApi, disasterApi } from '../api/client'
import { useAppStore } from '../store/appStore'

const COLORS = ['#ed1c24', '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899']

export default function DashboardPage() {
  const { mode } = useAppStore()

  // Fetch data
  const { data: coverage } = useQuery({
    queryKey: ['analysis', 'coverage'],
    queryFn: analysisApi.getCoverage,
  })

  const { data: metricsSummary } = useQuery({
    queryKey: ['metrics', 'summary'],
    queryFn: () => metricsApi.getSummary(),
  })

  const { data: disasterDashboard } = useQuery({
    queryKey: ['disaster', 'dashboard'],
    queryFn: () => disasterApi.getDashboard(),
    enabled: mode === 'disaster',
  })

  const { data: equity } = useQuery({
    queryKey: ['analysis', 'equity'],
    queryFn: analysisApi.getEquity,
  })

  // Transform data for charts
  const servicesByCategory = coverage?.services_by_category
    ? Object.entries(coverage.services_by_category).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value: value as number,
      }))
    : []

  const metricsData = metricsSummary
    ? Object.entries(metricsSummary).map(([type, data]) => ({
        name: type.replace(/_/g, ' '),
        total: (data as { total: number }).total,
        count: (data as { count: number }).count,
      }))
    : []

  return (
    <div className="p-6 overflow-y-auto h-full bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {mode === 'disaster' ? 'Disaster Response Dashboard' : 'Partner Impact Dashboard'}
          </h1>
          <p className="text-gray-500 mt-1">
            {mode === 'disaster'
              ? 'Real-time operational status and capabilities'
              : 'Overview of partner network and community impact'}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Partners"
            value={coverage?.total_partners || 0}
            color="bg-rc-red"
          />
          <StatCard
            title="Total Services"
            value={coverage?.total_services || 0}
            color="bg-blue-500"
          />
          <StatCard
            title="Avg Services/Partner"
            value={coverage?.average_services_per_partner || 0}
            color="bg-green-500"
          />
          {mode === 'disaster' ? (
            <StatCard
              title="Operational Partners"
              value={disasterDashboard?.status_breakdown?.operational || 0}
              color="bg-orange-500"
            />
          ) : (
            <StatCard
              title="Equity Score"
              value={`${((equity?.summary?.equity_score || 0) * 100).toFixed(0)}%`}
              color="bg-purple-500"
            />
          )}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Services by Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Services by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={servicesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {servicesByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Impact Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Impact Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricsData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#ed1c24" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Disaster Mode: Status breakdown */}
          {mode === 'disaster' && disasterDashboard && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Operational Status</h3>
              <div className="space-y-4">
                {Object.entries(disasterDashboard.status_breakdown || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{status.replace(/_/g, ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'operational'
                              ? 'bg-green-500'
                              : status === 'limited'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${
                              ((count as number) /
                                (disasterDashboard.active_status_reports || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-800 font-medium w-8">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equity Analysis */}
          {mode === 'steady' && equity && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Equity Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">High SVI Areas - Service Density</span>
                  <span className="font-semibold text-gray-800">
                    {equity.summary?.high_svi_service_density?.toFixed(2) || 'N/A'} per 1000
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Low SVI Areas - Service Density</span>
                  <span className="font-semibold text-gray-800">
                    {equity.summary?.low_svi_service_density?.toFixed(2) || 'N/A'} per 1000
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-gray-600">Disparity Ratio</span>
                  <span className="font-semibold text-orange-600">
                    {equity.summary?.disparity_ratio?.toFixed(2) || 'N/A'}x
                  </span>
                </div>
              </div>
              {equity.recommendations && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {equity.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-rc-red">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: number | string
  color: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  )
}
