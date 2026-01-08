"""Analysis endpoints for gap analysis, equity assessment, and AI insights."""
import os
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.partner import Partner
from ..models.service import Service, ServiceCategoryType
from ..models.metrics import PartnerMetrics

router = APIRouter()


@router.get("/coverage")
async def analyze_coverage(
    service_category: Optional[ServiceCategoryType] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Analyze service coverage across the region.

    Returns aggregated stats about where services are concentrated
    and where gaps might exist.
    """
    # Get all active partners with services
    query = select(Partner).where(Partner.is_active == True)
    result = await db.execute(query)
    partners = result.scalars().all()

    # Get services
    service_query = select(Service).where(Service.is_active == True)
    if service_category:
        service_query = service_query.where(Service.category == service_category)
    service_result = await db.execute(service_query)
    services = service_result.scalars().all()

    # Group by service category
    category_counts = {}
    for s in services:
        cat = s.category.value
        if cat not in category_counts:
            category_counts[cat] = 0
        category_counts[cat] += 1

    # Geographic distribution (simplified - group by lat/lng grid)
    # In production, this would use actual census tracts or ZIP codes
    geo_distribution = {}
    for p in partners:
        if p.latitude and p.longitude:
            # Create 0.1 degree grid cells (roughly 7 miles)
            grid_key = f"{round(p.latitude, 1)},{round(p.longitude, 1)}"
            if grid_key not in geo_distribution:
                geo_distribution[grid_key] = {"count": 0, "lat": round(p.latitude, 1), "lng": round(p.longitude, 1)}
            geo_distribution[grid_key]["count"] += 1

    return {
        "total_partners": len(partners),
        "total_services": len(services),
        "services_by_category": category_counts,
        "geographic_distribution": list(geo_distribution.values()),
        "average_services_per_partner": round(len(services) / max(len(partners), 1), 2),
    }


@router.get("/gaps")
async def identify_gaps(db: AsyncSession = Depends(get_db)):
    """
    Identify service gaps in the region.

    Compares service availability against need indicators.
    Returns areas with high need but low service coverage.
    """
    # This is a simplified version - in production would use actual SVI data
    # For now, return a structure showing what the analysis would look like

    return {
        "analysis_type": "service_gap_analysis",
        "note": "This endpoint will integrate with CDC SVI and local vulnerability data",
        "sample_gaps": [
            {
                "area_id": "sample_tract_001",
                "area_name": "High Vulnerability Census Tract",
                "svi_score": 0.85,
                "population": 5000,
                "service_count": 1,
                "services_per_1000": 0.2,
                "gap_severity": "high",
                "missing_services": ["food_pantry", "mental_health_support", "utility_assistance"],
            },
            {
                "area_id": "sample_tract_002",
                "area_name": "Moderate Need Area",
                "svi_score": 0.65,
                "population": 8000,
                "service_count": 3,
                "services_per_1000": 0.375,
                "gap_severity": "medium",
                "missing_services": ["shelter_referral", "job_readiness"],
            },
        ],
        "recommendations": [
            "Prioritize food security services in high-SVI areas",
            "Expand mental health support in underserved census tracts",
            "Consider mobile services for areas with transportation barriers",
        ],
    }


@router.get("/equity")
async def equity_assessment(db: AsyncSession = Depends(get_db)):
    """
    Assess equity of service distribution.

    Compares service density in high-vulnerability areas vs low-vulnerability areas.
    """
    return {
        "analysis_type": "equity_assessment",
        "note": "Full implementation requires SVI overlay data",
        "summary": {
            "equity_score": 0.72,  # Placeholder - 1.0 = perfectly equitable
            "high_svi_service_density": 1.2,  # Services per 1000 people
            "low_svi_service_density": 2.8,
            "disparity_ratio": 2.33,  # Low SVI areas have 2.33x more services
        },
        "recommendations": [
            "Increase partner recruitment in high-SVI census tracts",
            "Support existing partners in high-need areas with capacity building",
            "Consider transportation assistance to connect residents to services",
        ],
    }


@router.get("/impact-summary")
async def get_impact_summary(
    partner_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get aggregated impact metrics."""
    query = select(
        PartnerMetrics.metric_type,
        func.sum(PartnerMetrics.metric_value).label("total"),
        func.count(PartnerMetrics.id).label("reports"),
    ).group_by(PartnerMetrics.metric_type)

    if partner_id:
        import uuid
        try:
            pid = uuid.UUID(partner_id)
            query = query.where(PartnerMetrics.partner_id == pid)
        except ValueError:
            pass

    result = await db.execute(query)
    rows = result.all()

    return {
        "metrics": {
            row.metric_type.value: {
                "total": row.total,
                "report_count": row.reports,
            }
            for row in rows
        },
    }


@router.post("/ai/summarize")
async def ai_summarize(
    partner_id: Optional[str] = None,
    prompt: str = "Summarize the impact and activities of this partner network.",
    db: AsyncSession = Depends(get_db),
):
    """
    Use Claude AI to generate insights and summaries.

    Can summarize:
    - Individual partner impact
    - Network-wide trends
    - Gap analysis narratives
    - Recommendations
    """
    # Check for API key
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return {
            "error": "AI features require ANTHROPIC_API_KEY environment variable",
            "suggestion": "Set the API key to enable AI-powered summaries",
        }

    # Gather context data
    context_parts = []

    if partner_id:
        import uuid
        try:
            pid = uuid.UUID(partner_id)
            partner_result = await db.execute(select(Partner).where(Partner.id == pid))
            partner = partner_result.scalar_one_or_none()
            if partner:
                context_parts.append(f"Partner: {partner.organization_name}")
                context_parts.append(f"Type: {partner.organization_type.value}")
                context_parts.append(f"Mission: {partner.mission_statement or 'Not provided'}")
        except ValueError:
            pass
    else:
        # Get network-wide stats
        partner_count = await db.execute(select(func.count(Partner.id)).where(Partner.is_active == True))
        service_count = await db.execute(select(func.count(Service.id)).where(Service.is_active == True))
        context_parts.append(f"Total active partners: {partner_count.scalar()}")
        context_parts.append(f"Total active services: {service_count.scalar()}")

    context = "\n".join(context_parts)

    # Call Claude API
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": f"""You are analyzing a partner network GIS system for disaster response and community services.

Context:
{context}

User request: {prompt}

Provide a concise, actionable summary.""",
                }
            ],
        )

        return {
            "summary": message.content[0].text,
            "context_used": context,
        }

    except Exception as e:
        return {
            "error": f"AI summarization failed: {str(e)}",
            "context_available": context,
        }


@router.get("/readiness-score")
async def calculate_readiness_score(
    partner_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Calculate disaster readiness score for a partner or the entire network.

    Factors:
    - Disaster capabilities registered
    - Training completed
    - Recent status updates
    - Network connectivity
    """
    from ..models.disaster import DisasterCapability
    from ..models.training import TrainingReadiness

    # This is a simplified scoring model
    # In production, would have weighted factors and more sophisticated calculation

    if partner_id:
        import uuid
        try:
            pid = uuid.UUID(partner_id)

            # Get capabilities
            cap_result = await db.execute(
                select(func.count(DisasterCapability.id)).where(
                    DisasterCapability.partner_id == pid,
                    DisasterCapability.is_current == True,
                )
            )
            cap_count = cap_result.scalar()

            # Get training
            train_result = await db.execute(
                select(TrainingReadiness).where(TrainingReadiness.partner_id == pid)
            )
            training = train_result.scalar_one_or_none()

            # Calculate score (0-100)
            score = 0
            score += min(cap_count * 10, 40)  # Up to 40 points for capabilities
            if training:
                trainings = training.trainings_completed or []
                score += min(len(trainings) * 8, 40)  # Up to 40 points for training
                if training.overall_readiness_score:
                    score += training.overall_readiness_score * 2  # Up to 20 points for self-assessment

            return {
                "partner_id": partner_id,
                "readiness_score": min(score, 100),
                "capabilities_count": cap_count,
                "training_completed": len(training.trainings_completed) if training and training.trainings_completed else 0,
                "factors": {
                    "capabilities": min(cap_count * 10, 40),
                    "training": min(len(training.trainings_completed) * 8 if training and training.trainings_completed else 0, 40),
                    "self_assessment": training.overall_readiness_score * 2 if training and training.overall_readiness_score else 0,
                },
            }

        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid partner ID")

    else:
        # Network-wide readiness
        cap_result = await db.execute(
            select(func.count(DisasterCapability.id)).where(DisasterCapability.is_current == True)
        )
        total_capabilities = cap_result.scalar()

        partner_result = await db.execute(
            select(func.count(Partner.id)).where(Partner.is_active == True)
        )
        total_partners = partner_result.scalar()

        return {
            "network_readiness": {
                "total_partners": total_partners,
                "total_disaster_capabilities": total_capabilities,
                "average_capabilities_per_partner": round(total_capabilities / max(total_partners, 1), 2),
            },
        }
