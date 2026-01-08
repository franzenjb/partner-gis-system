import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="overflow-y-auto h-full bg-gray-50">
      {/* Hero Section with Disclaimer */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold uppercase tracking-wide">
              Prototype Demo
            </span>
            <span className="px-3 py-1 bg-red-600 rounded-full text-sm font-semibold uppercase tracking-wide">
              Fictitious Data
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Partner Capability, Impact, Network & Risk GIS System
          </h1>
          <p className="text-lg text-white/90 max-w-3xl">
            A preliminary user interface demonstration showcasing potential functionality
            for managing community partner networks. This prototype uses simulated data
            to illustrate UI/UX possibilities.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Important Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-800 text-lg mb-2">Important: Demonstration Only</h3>
              <ul className="text-amber-700 space-y-1 text-sm">
                <li>All partner data shown is <strong>completely fictitious</strong> - no real organizations are represented</li>
                <li>This is a <strong>preliminary UI mockup</strong> demonstrating potential functionality</li>
                <li>The backend uses <strong>mock data</strong> - no real database is connected</li>
                <li>Significant development work is required to make this system production-ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Client Proposal Reference */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Original Project Requirements</h2>
          <p className="text-gray-600 mb-6">
            This system addresses the requirements outlined in the
            <em> Partner Capability, Impact, Network & Risk GIS System</em> specification.
          </p>

          {/* Core Questions */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold text-rc-red mb-4 text-lg">Core Questions This System Must Answer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">1</span>
                  Steady-State Questions
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-8">
                  <li>• Which partners serve the highest SVI tracts?</li>
                  <li>• Where are services overlapping heavily?</li>
                  <li>• Where are high-need areas with few services?</li>
                  <li>• Which partners are most central in the network?</li>
                  <li>• Which partners are under-connected?</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">2</span>
                  Disaster Mode Questions
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-8">
                  <li>• Who can provide feeding/sheltering in high-risk zones?</li>
                  <li>• Where are disaster-ready partners clustered?</li>
                  <li>• Where are gaps in mass care coverage?</li>
                  <li>• Which partners can scale during an event?</li>
                  <li>• Who is operational right now?</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 8-Layer Data Model */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-semibold text-rc-red mb-4 text-lg">Required 8-Layer GIS Data Model</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DataLayerCard layer={1} title="Partner Core Profile" desc="Point layer - anchor for all joins & relationships" status="demo" />
              <DataLayerCard layer={2} title="Day-to-Day Services" desc="Related table with service tags & categories" status="demo" />
              <DataLayerCard layer={3} title="Service Areas" desc="Polygon layer - ZIP, tract, drive-time coverage" status="partial" />
              <DataLayerCard layer={4} title="Partner Impact Metrics" desc="Time-enabled table for dashboards & reporting" status="demo" />
              <DataLayerCard layer={5} title="Disaster Capabilities" desc="Response & recovery capacity by partner" status="demo" />
              <DataLayerCard layer={6} title="Real-Time Disaster Status" desc="Event-based operational status tracking" status="planned" />
              <DataLayerCard layer={7} title="Training & Readiness" desc="Strategic planning & gap assessment" status="planned" />
              <DataLayerCard layer={8} title="Partner Network" desc="Relationship edges for network analysis" status="demo" />
            </div>
          </div>

          {/* Required Overlay Layers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-rc-red mb-4 text-lg">Required Contextual Overlay Layers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Social Vulnerability</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• CDC SVI (tract-level)</li>
                  <li>• Individual SVI domains</li>
                  <li>• CalEnviroScreen</li>
                </ul>
                <span className="mt-2 inline-block text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Data Integration Required</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Hazard Vulnerability</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Wildfire risk (CAL FIRE)</li>
                  <li>• Flood zones (FEMA)</li>
                  <li>• Extreme heat</li>
                  <li>• Power shutoff (PSPS)</li>
                </ul>
                <span className="mt-2 inline-block text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Data Integration Required</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Health & Access</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Food access / food deserts</li>
                  <li>• Health burden indicators</li>
                  <li>• Transportation access</li>
                </ul>
                <span className="mt-2 inline-block text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Data Integration Required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Current Demo Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">What This Demo Includes</h2>
          <p className="text-gray-600 mb-6">Explore the current UI capabilities by clicking on any feature below.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              title="Interactive Map"
              description="MapLibre GL JS powered map with partner locations, search sidebar, and service filtering"
              link="/map"
              icon={<MapIcon />}
              color="bg-blue-500"
              tech="MapLibre GL JS"
            />
            <FeatureCard
              title="Network Analysis"
              description="Force-directed graph visualization showing partner relationships and centrality metrics"
              link="/network"
              icon={<NetworkIcon />}
              color="bg-purple-500"
              tech="Cytoscape.js + NetworkX"
            />
            <FeatureCard
              title="Analytics Dashboard"
              description="Charts and metrics including service distribution, impact data, and equity analysis"
              link="/dashboard"
              icon={<ChartIcon />}
              color="bg-green-500"
              tech="Recharts"
            />
            <FeatureCard
              title="Partner Directory"
              description="Searchable partner list with detailed profiles and service information"
              link="/partners"
              icon={<UsersIcon />}
              color="bg-orange-500"
              tech="React + TanStack Query"
            />
            <FeatureCard
              title="Admin Panel"
              description="Administrative interface for approvals, readiness tracking, and system management"
              link="/admin"
              icon={<AdminIcon />}
              color="bg-red-500"
              tech="Role-based UI"
            />
            <FeatureCard
              title="Dual-Mode Toggle"
              description="Switch between Steady State and Disaster Mode to see context-specific views"
              link="/dashboard"
              icon={<ToggleIcon />}
              color="bg-gray-700"
              tech="Zustand State"
            />
          </div>
        </section>

        {/* Requirements for Production */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Requirements for Production System</h2>
          <p className="text-gray-600 mb-6">
            Transforming this prototype into a fully functional production system requires
            substantial work across multiple areas.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Requirements */}
            <RequirementSection
              title="Data Requirements"
              icon={<DatabaseIcon />}
              color="text-blue-600"
              items={[
                { name: 'Partner Data Collection', desc: 'Forms and workflows for 100+ partners to submit organizational profiles, services, and capacity information' },
                { name: 'Service Area Polygons', desc: 'Geographic boundaries defining each partner\'s coverage area (ZIP codes, census tracts, or custom polygons)' },
                { name: 'Impact Metrics System', desc: 'Quarterly data collection for clients served, meals provided, financial assistance, volunteer hours, etc.' },
                { name: 'Network Relationships', desc: 'Documentation of partnerships, referral agreements, and collaboration patterns between organizations' },
                { name: 'CDC Social Vulnerability Index', desc: 'Integration of census tract-level SVI data for equity analysis and gap identification' },
                { name: 'FEMA Flood Zones', desc: 'Flood risk layer data for disaster planning and partner capability assessment' },
                { name: 'CAL FIRE Wildfire Risk', desc: 'Fire hazard severity zones for California-specific disaster preparedness' },
              ]}
            />

            {/* Technical Infrastructure */}
            <RequirementSection
              title="Technical Infrastructure"
              icon={<ServerIcon />}
              color="text-green-600"
              items={[
                { name: 'PostgreSQL + PostGIS Database', desc: 'Production database with spatial extensions for geographic queries and polygon operations' },
                { name: 'FastAPI Backend (Python)', desc: 'RESTful API server with async support, validation, and comprehensive endpoint coverage' },
                { name: 'Authentication System', desc: 'Secure login with role-based access control (Admin, Analyst, Partner, Public)' },
                { name: 'User Management', desc: 'Partner self-registration, admin approval workflows, and account management' },
                { name: 'Data Validation Pipelines', desc: 'Input validation, geocoding verification, and data quality checks' },
                { name: 'Backup & Recovery', desc: 'Automated database backups, disaster recovery procedures, and data retention policies' },
              ]}
            />

            {/* Development Work */}
            <RequirementSection
              title="Development Work Required"
              icon={<CodeIcon />}
              color="text-purple-600"
              items={[
                { name: 'Complete API Endpoints', desc: 'Full CRUD operations, complex queries, aggregations, and reporting endpoints' },
                { name: 'Partner Registration Forms', desc: 'Multi-step onboarding wizard with validation, geocoding, and admin review queue' },
                { name: 'Quarterly Data Collection', desc: 'Recurring metrics submission forms with reminders and deadline management' },
                { name: 'Service Area Editor', desc: 'Map-based polygon drawing tools for partners to define coverage areas' },
                { name: 'Drive-Time Isochrones', desc: 'Integration with routing API to generate 10/20/30 minute travel time polygons' },
                { name: 'AI Summary Integration', desc: 'Claude API integration for natural language summaries and insights' },
                { name: 'Export & Reporting', desc: 'PDF/CSV exports for dashboards, partner profiles, and network analysis' },
              ]}
            />

            {/* External Integrations */}
            <RequirementSection
              title="External Integrations"
              icon={<PlugIcon />}
              color="text-orange-600"
              items={[
                { name: 'OpenRouteService API', desc: 'Isochrone generation for drive-time analysis and accessibility mapping' },
                { name: 'Claude API (Anthropic)', desc: 'AI-powered summaries, gap analysis narratives, and natural language search' },
                { name: 'SendGrid Email Service', desc: 'Automated notifications, quarterly reminders, and disaster activation alerts' },
                { name: 'Census Bureau / ACS Data', desc: 'Demographic data feeds for population analysis and equity metrics' },
                { name: 'Geocoding Service', desc: 'Address-to-coordinate conversion for partner location mapping' },
              ]}
            />
          </div>
        </section>

        {/* Cost Estimates */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Estimated Operating Costs</h2>
          <p className="text-gray-600 mb-6">
            Monthly infrastructure costs for a production deployment. Development/consulting costs are separate.
          </p>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Monthly Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <CostRow service="Frontend Hosting" provider="Vercel" cost="$0" notes="Free tier sufficient for most use cases" />
                <CostRow service="Backend + API" provider="Railway" cost="$20" notes="Scales with usage; includes compute" />
                <CostRow service="PostgreSQL Database" provider="Railway" cost="Included" notes="Bundled with backend hosting" />
                <CostRow service="AI Summaries" provider="Claude API" cost="$10-50" notes="Pay per use; depends on query volume" />
                <CostRow service="Email Automation" provider="SendGrid" cost="$0" notes="Free tier: 100 emails/day" />
                <CostRow service="Routing/Isochrones" provider="OpenRouteService" cost="$0" notes="Free tier sufficient" />
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-gray-800">Estimated Total</td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-green-600">$30-70/mo</td>
                  <td className="px-6 py-4 text-sm text-gray-600">vs. ArcGIS Online ~$500+/year</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            * Development and consulting costs for building the production system are not included above.
            These estimates cover ongoing infrastructure costs only.
          </p>
        </section>

        {/* Development Phases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Development Roadmap</h2>
          <p className="text-gray-600 mb-6">
            Building a production-ready system involves multiple phases of work.
          </p>

          <div className="space-y-4">
            <PhaseCard
              phase={1}
              title="Database & Core API"
              status="foundation"
              items={['PostgreSQL schema design', 'FastAPI endpoint structure', 'Authentication system', 'Basic CRUD operations']}
            />
            <PhaseCard
              phase={2}
              title="Data Collection System"
              status="pending"
              items={['Partner registration forms', 'Admin review queue', 'CSV bulk import', 'Data validation']}
            />
            <PhaseCard
              phase={3}
              title="Maps & Visualization Layers"
              status="partial"
              items={['Partner point layer', 'Service area polygons', 'Vulnerability overlays (SVI, flood, fire)', 'Drive-time isochrones']}
            />
            <PhaseCard
              phase={4}
              title="Network Analysis"
              status="partial"
              items={['Relationship data model', 'Centrality calculations', 'Community detection', 'Connection recommendations']}
            />
            <PhaseCard
              phase={5}
              title="Dashboards & Analytics"
              status="partial"
              items={['Impact metrics tracking', 'Equity analysis', 'Disaster readiness scoring', 'Export to PDF/CSV']}
            />
            <PhaseCard
              phase={6}
              title="AI Integration"
              status="pending"
              items={['Claude API connection', 'Partner summaries', 'Gap analysis narratives', 'Natural language search']}
            />
            <PhaseCard
              phase={7}
              title="Automation & Polish"
              status="pending"
              items={['Email notifications', 'Quarterly reminders', 'Disaster activation workflow', 'Mobile optimization']}
            />
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Technology Stack</h2>
          <p className="text-gray-600 mb-6">
            This system is built with modern, open-source technologies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </span>
                Frontend
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>React 18</strong> - UI framework</li>
                <li><strong>TypeScript</strong> - Type-safe JavaScript</li>
                <li><strong>MapLibre GL JS</strong> - Interactive mapping</li>
                <li><strong>Cytoscape.js</strong> - Network graph visualization</li>
                <li><strong>Recharts</strong> - Dashboard charts</li>
                <li><strong>TanStack Query</strong> - Data fetching & caching</li>
                <li><strong>Zustand</strong> - State management</li>
                <li><strong>Tailwind CSS</strong> - Styling</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1z"/></svg>
                </span>
                Backend
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>Python 3.11+</strong> - Server language</li>
                <li><strong>FastAPI</strong> - Async web framework</li>
                <li><strong>SQLAlchemy 2.0</strong> - ORM</li>
                <li><strong>PostgreSQL + PostGIS</strong> - Database</li>
                <li><strong>NetworkX</strong> - Graph algorithms</li>
                <li><strong>Pydantic</strong> - Data validation</li>
                <li><strong>Anthropic SDK</strong> - Claude AI integration</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              <p><strong>Partner GIS System</strong> - Prototype Demo v0.1</p>
              <p>Built with React, MapLibre, Cytoscape.js, and FastAPI</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/franzenjb/partner-gis-system"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" clipRule="evenodd"/></svg>
                View on GitHub
              </a>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
            Demonstration prototype - January 2025
          </div>
        </footer>
      </div>
    </div>
  )
}

// Feature Card Component
function FeatureCard({
  title,
  description,
  link,
  icon,
  color,
  tech
}: {
  title: string
  description: string
  link: string
  icon: React.ReactNode
  color: string
  tech: string
}) {
  return (
    <Link to={link} className="block">
      <div className="bg-white rounded-lg shadow p-5 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{description}</p>
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">{tech}</span>
      </div>
    </Link>
  )
}

// Requirement Section Component
function RequirementSection({
  title,
  icon,
  color,
  items
}: {
  title: string
  icon: React.ReactNode
  color: string
  items: { name: string; desc: string }[]
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className={`font-semibold text-gray-800 mb-4 flex items-center gap-2 ${color}`}>
        {icon}
        {title}
      </h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="text-sm">
            <span className="font-medium text-gray-800">{item.name}</span>
            <p className="text-gray-500 mt-0.5">{item.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Cost Row Component
function CostRow({
  service,
  provider,
  cost,
  notes
}: {
  service: string
  provider: string
  cost: string
  notes: string
}) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm text-gray-800">{service}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{provider}</td>
      <td className="px-6 py-4 text-sm text-right font-medium text-gray-800">{cost}</td>
      <td className="px-6 py-4 text-sm text-gray-500">{notes}</td>
    </tr>
  )
}

// Phase Card Component
function PhaseCard({
  phase,
  title,
  status,
  items
}: {
  phase: number
  title: string
  status: 'complete' | 'partial' | 'pending' | 'foundation'
  items: string[]
}) {
  const statusConfig = {
    complete: { bg: 'bg-green-100', text: 'text-green-700', label: 'Complete' },
    partial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Demo Only' },
    pending: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Started' },
    foundation: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Foundation Built' },
  }
  const config = statusConfig[status]

  return (
    <div className="bg-white rounded-lg shadow p-4 flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-rc-red rounded-lg flex items-center justify-center text-white font-bold text-lg">
        {phase}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <span className={`text-xs px-2 py-1 rounded ${config.bg} ${config.text}`}>{config.label}</span>
        </div>
        <ul className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <li key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Icons
const MapIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
)

const NetworkIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)

const ChartIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const AdminIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ToggleIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
)

const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
)

const ServerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
)

const CodeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const PlugIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)

// Data Layer Card Component
function DataLayerCard({
  layer,
  title,
  desc,
  status
}: {
  layer: number
  title: string
  desc: string
  status: 'demo' | 'partial' | 'planned'
}) {
  const statusConfig = {
    demo: { bg: 'bg-green-100', text: 'text-green-700', label: 'Demo Data' },
    partial: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Partial' },
    planned: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Planned' },
  }
  const config = statusConfig[status]

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 bg-rc-red rounded text-white text-xs font-bold flex items-center justify-center">
          {layer}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${config.bg} ${config.text}`}>{config.label}</span>
      </div>
      <h4 className="font-medium text-gray-800 text-sm">{title}</h4>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </div>
  )
}
