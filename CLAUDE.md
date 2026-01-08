# CLAUDE.md - Partner GIS System

This file provides context for Claude Code when working on this project.

## Project Overview

This is a **Partner Capability, Impact, Network & Risk GIS System** - a full-stack web application for managing community partner networks. It replaces ArcGIS Online with open-source tools and adds capabilities ArcGIS cannot provide (network analysis, AI integration).

### Primary Users
1. **Case Managers** - Mobile-friendly interface for finding partners/services
2. **Analysts/Planners** - Deep analytics, network analysis, strategic dashboards
3. **Administrators** - Partner approval, data management, reporting

### Core Functionality
- Interactive mapping with MapLibre GL JS
- Network graph analysis with NetworkX (Python) and Cytoscape.js (frontend)
- Dual-mode operation: Steady-State vs Disaster Mode
- Impact tracking and equity analysis
- AI-powered summaries via Claude API

## Architecture

### Backend (Python/FastAPI)
```
backend/app/
├── main.py          # FastAPI app entry point
├── database.py      # SQLAlchemy async engine (PostgreSQL/PostGIS)
├── schemas.py       # Pydantic request/response models
├── models/          # SQLAlchemy ORM models (8 core layers)
├── routes/          # API endpoint handlers
└── services/        # Business logic (network_analysis.py)
```

### Frontend (React/TypeScript)
```
frontend/src/
├── api/client.ts    # Axios API client
├── store/           # Zustand state management
├── pages/           # Route components (Map, Dashboard, Network, Partners, Admin)
├── components/      # Reusable UI components
└── types/           # TypeScript interfaces
```

## Key Files to Know

### Backend
- `backend/app/models/partner.py` - Core partner model with all fields
- `backend/app/models/network.py` - Graph edge model for relationships
- `backend/app/routes/network.py` - NetworkX integration endpoints
- `backend/app/routes/search.py` - PostGIS spatial queries
- `backend/app/services/network_analysis.py` - Centrality calculations

### Frontend
- `frontend/src/pages/MapPage.tsx` - Main map with MapLibre
- `frontend/src/pages/NetworkPage.tsx` - Cytoscape.js graph visualization
- `frontend/src/pages/DashboardPage.tsx` - Recharts dashboards
- `frontend/src/store/appStore.ts` - Global state (mode, selected partner)
- `frontend/src/api/client.ts` - All API calls

## Data Model (8 Layers)

| Layer | Table | Purpose |
|-------|-------|---------|
| 1 | `partners` | Core profile, location (PostGIS point) |
| 2 | `partner_services` | Day-to-day services offered |
| 3 | `service_areas` | Coverage polygons (ZIP, tract, drive-time) |
| 4 | `partner_metrics` | Time-series impact data |
| 5 | `disaster_capabilities` | Response/recovery capacity |
| 6 | `disaster_status` | Real-time event status |
| 7 | `training_readiness` | Preparedness tracking |
| 8 | `partner_network` | Graph edges (relationships) |

## Common Tasks

### Adding a New API Endpoint
1. Add route in `backend/app/routes/`
2. Add Pydantic schema in `backend/app/schemas.py`
3. Include router in `backend/app/main.py`
4. Add client method in `frontend/src/api/client.ts`

### Adding a New Data Field
1. Add to SQLAlchemy model in `backend/app/models/`
2. Add to Pydantic schema in `backend/app/schemas.py`
3. Update TypeScript types in `frontend/src/types/`
4. Run database migration (or recreate tables)

### Modifying Network Analysis
- Edit `backend/app/services/network_analysis.py`
- Uses NetworkX library for graph algorithms
- Available: degree_centrality, betweenness_centrality, eigenvector_centrality, louvain_communities

### Adding Map Layers
- Edit `frontend/src/pages/MapPage.tsx`
- MapLibre GL JS documentation: https://maplibre.org/maplibre-gl-js/docs/
- Add source with `map.addSource()`, layer with `map.addLayer()`

## Environment Setup

### Required Environment Variables
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
ANTHROPIC_API_KEY=sk-ant-...  # Optional, for AI features
```

### For Supabase
```bash
DATABASE_URL=postgresql+asyncpg://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### Running Locally
```bash
# Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev
```

## Code Style

### Python
- Use async/await for database operations
- Type hints required
- Pydantic for validation
- Follow existing patterns in routes/

### TypeScript/React
- Functional components with hooks
- TanStack Query for data fetching
- Zustand for global state
- Tailwind CSS for styling

## Testing Endpoints

```bash
# List partners
curl http://localhost:8000/api/partners

# Get GeoJSON
curl http://localhost:8000/api/partners/geojson

# Network analysis
curl http://localhost:8000/api/network/analysis

# Search nearby
curl "http://localhost:8000/api/search/nearby?lat=37.7749&lng=-122.4194&radius_miles=5"
```

## Deployment Notes

### Frontend (Vercel)
- Auto-deploys from main branch
- Set `VITE_API_URL` if backend is different domain

### Backend (Railway/Render)
- Set `DATABASE_URL` environment variable
- PostGIS extension must be enabled in database
- Health check: `GET /health`

## Red Cross Brand Guidelines

When adding UI components, follow these style patterns:
- Primary color: `#ed1c24` (Red Cross red)
- Dark variant: `#c41e3a`
- Use Tailwind classes: `bg-rc-red`, `text-rc-red`
- Clean, non-alarmist color palettes
- Equity framing (not deficit framing)
- Clear toggles between Steady-State and Disaster Mode

## Known Limitations

1. **PostGIS Required** - Some spatial features need PostGIS extension
2. **Network Analysis Memory** - Large graphs (10k+ nodes) may need optimization
3. **Drive-Time Isochrones** - Requires OpenRouteService API integration (not yet implemented)
4. **Offline Mode** - Not currently supported

## Future Enhancements

- [ ] Drive-time isochrone generation
- [ ] StoryMap-style scrollytelling pages
- [ ] CSV bulk import
- [ ] Email automation for quarterly reminders
- [ ] Mobile app (React Native)
- [ ] Offline caching with service workers
