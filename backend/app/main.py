"""Partner GIS System - FastAPI Application."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routes import partners, services, metrics, disaster, network, search, analysis


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    yield


app = FastAPI(
    title="Partner GIS System",
    description="Partner Capability, Impact, Network & Risk GIS Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(partners.router, prefix="/api/partners", tags=["Partners"])
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(disaster.router, prefix="/api/disaster", tags=["Disaster"])
app.include_router(network.router, prefix="/api/network", tags=["Network"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])


@app.get("/")
async def root():
    return {
        "name": "Partner GIS System",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "partners": "/api/partners",
            "services": "/api/services",
            "metrics": "/api/metrics",
            "disaster": "/api/disaster",
            "network": "/api/network",
            "search": "/api/search",
            "analysis": "/api/analysis",
        },
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
