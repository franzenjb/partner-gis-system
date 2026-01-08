# Partner GIS System

A full-stack GIS platform for managing community partner networks, tracking impact metrics, analyzing network connectivity, and coordinating disaster response. Built as an open-source alternative to ArcGIS Online with enhanced network analysis capabilities.

## Features

### Core Capabilities
- **Interactive Mapping** - MapLibre GL JS with partner locations, service areas, and vulnerability overlays
- **Network Analysis** - True graph analytics using NetworkX (centrality, community detection, path analysis)
- **Dual-Mode Operation** - Switch between Steady-State and Disaster Mode views
- **Impact Dashboards** - Real-time metrics visualization with Recharts
- **AI-Powered Insights** - Claude API integration for summaries and gap analysis
- **Spatial Search** - Find partners by location, services, accessibility, and more

### Data Layers (8 Core Layers)
1. **Partner Core Profile** - Organization details, location, contact info
2. **Day-to-Day Services** - Categorized services with availability
3. **Service Areas** - Polygons defining coverage (ZIP, tract, drive-time)
4. **Impact Metrics** - Time-series data for reporting
5. **Disaster Capabilities** - Response/recovery capacity
6. **Real-Time Disaster Status** - Event-based operational status
7. **Training & Readiness** - Preparedness tracking
8. **Partner Network** - Collaboration relationships for graph analysis

### Network Analysis Features
- Degree centrality (most connected)
- Betweenness centrality (critical bridges)
- Eigenvector centrality (influence)
- Community detection (natural clusters)
- Isolated node identification
- Connection recommendations

## Tech Stack

### Backend
- **FastAPI** - Modern async Python API framework
- **PostgreSQL + PostGIS** - Spatial database (Supabase compatible)
- **SQLAlchemy** - ORM with GeoAlchemy2 for spatial queries
- **NetworkX** - Graph analysis library
- **Anthropic Claude API** - AI summaries and insights

### Frontend
- **React 18** + TypeScript
- **MapLibre GL JS** - Open-source mapping
- **Cytoscape.js** - Network graph visualization
- **Recharts** - Dashboard charts
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL with PostGIS extension (or Supabase account)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql+asyncpg://user:pass@host:5432/dbname"
export ANTHROPIC_API_KEY="sk-ant-..."  # Optional, for AI features

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open http://localhost:3000

### Using Supabase

1. Create a new Supabase project
2. Enable the PostGIS extension: `CREATE EXTENSION postgis;`
3. Get your connection string from Settings > Database
4. Set `DATABASE_URL` with the connection string (use `asyncpg` driver)

```bash
export DATABASE_URL="postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

## API Endpoints

### Partners
- `GET /api/partners` - List all partners
- `GET /api/partners/geojson` - Partners as GeoJSON for mapping
- `GET /api/partners/{id}` - Get partner details
- `POST /api/partners` - Create partner
- `PUT /api/partners/{id}` - Update partner
- `POST /api/partners/{id}/approve` - Approve pending partner

### Services
- `GET /api/services` - List services
- `GET /api/services/categories` - Get service category taxonomy
- `POST /api/services` - Add service to partner

### Metrics
- `GET /api/metrics` - List impact metrics
- `GET /api/metrics/summary` - Aggregated metrics
- `GET /api/metrics/timeseries` - Time-series data
- `POST /api/metrics` - Submit metrics

### Network
- `GET /api/network/graph` - Full network for visualization
- `GET /api/network/analysis` - Centrality & community analysis
- `GET /api/network/partner/{id}/connections` - Partner's connections
- `POST /api/network/edges` - Create relationship

### Search
- `GET /api/search/partners` - Search with filters
- `GET /api/search/nearby` - Find partners near location
- `GET /api/search/services` - Search services

### Analysis
- `GET /api/analysis/coverage` - Service coverage analysis
- `GET /api/analysis/gaps` - Gap identification
- `GET /api/analysis/equity` - Equity assessment
- `POST /api/analysis/ai/summarize` - AI-generated summaries

### Disaster
- `GET /api/disaster/capabilities` - Disaster capabilities
- `GET /api/disaster/status` - Real-time status
- `GET /api/disaster/dashboard` - Disaster dashboard data
- `POST /api/disaster/status` - Update operational status

## Project Structure

```
partner-gis-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── database.py          # Database connection
│   │   ├── schemas.py           # Pydantic models
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── partner.py       # Core partner model
│   │   │   ├── service.py       # Services
│   │   │   ├── metrics.py       # Impact metrics
│   │   │   ├── disaster.py      # Disaster capabilities
│   │   │   ├── network.py       # Network edges
│   │   │   └── ...
│   │   ├── routes/              # API endpoints
│   │   │   ├── partners.py
│   │   │   ├── network.py
│   │   │   ├── search.py
│   │   │   └── ...
│   │   └── services/            # Business logic
│   │       └── network_analysis.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/client.ts        # API client
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── store/               # Zustand store
│   │   └── types/               # TypeScript types
│   ├── package.json
│   └── vite.config.ts
│
├── README.md
└── CLAUDE.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `ANTHROPIC_API_KEY` | Claude API key for AI features | No |

## Deployment

### Recommended Setup
- **Frontend**: Vercel (free tier)
- **Backend**: Railway or Render (~$20/month)
- **Database**: Supabase (free tier available)

### Docker (coming soon)
```bash
docker-compose up
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file

## Acknowledgments

Built with Claude Code by Anthropic. Designed for American Red Cross partner network management.
