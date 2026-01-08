"""Impact Metrics endpoints."""
import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.metrics import PartnerMetrics, MetricType
from ..schemas import MetricsCreate, MetricsResponse

router = APIRouter()


@router.get("/", response_model=List[MetricsResponse])
async def list_metrics(
    partner_id: Optional[str] = None,
    metric_type: Optional[MetricType] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """List metrics with optional filters."""
    query = select(PartnerMetrics)

    if partner_id:
        try:
            pid = uuid.UUID(partner_id)
            query = query.where(PartnerMetrics.partner_id == pid)
        except ValueError:
            pass

    if metric_type:
        query = query.where(PartnerMetrics.metric_type == metric_type)

    if start_date:
        query = query.where(PartnerMetrics.reporting_period_start >= start_date)

    if end_date:
        query = query.where(PartnerMetrics.reporting_period_end <= end_date)

    query = query.order_by(PartnerMetrics.reporting_period_start.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/summary")
async def get_metrics_summary(
    partner_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get aggregated metrics summary."""
    query = select(
        PartnerMetrics.metric_type,
        func.sum(PartnerMetrics.metric_value).label("total"),
        func.count(PartnerMetrics.id).label("count"),
        func.avg(PartnerMetrics.metric_value).label("average"),
    ).group_by(PartnerMetrics.metric_type)

    if partner_id:
        try:
            pid = uuid.UUID(partner_id)
            query = query.where(PartnerMetrics.partner_id == pid)
        except ValueError:
            pass

    if start_date:
        query = query.where(PartnerMetrics.reporting_period_start >= start_date)

    if end_date:
        query = query.where(PartnerMetrics.reporting_period_end <= end_date)

    result = await db.execute(query)
    rows = result.all()

    return {
        row.metric_type.value: {
            "total": row.total,
            "count": row.count,
            "average": float(row.average) if row.average else 0,
        }
        for row in rows
    }


@router.get("/timeseries")
async def get_metrics_timeseries(
    metric_type: MetricType,
    partner_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get time-series data for a specific metric type."""
    query = select(PartnerMetrics).where(
        PartnerMetrics.metric_type == metric_type
    ).order_by(PartnerMetrics.reporting_period_start)

    if partner_id:
        try:
            pid = uuid.UUID(partner_id)
            query = query.where(PartnerMetrics.partner_id == pid)
        except ValueError:
            pass

    result = await db.execute(query)
    metrics = result.scalars().all()

    return [
        {
            "period_start": m.reporting_period_start.isoformat(),
            "period_end": m.reporting_period_end.isoformat(),
            "value": m.metric_value,
            "partner_id": str(m.partner_id),
        }
        for m in metrics
    ]


@router.post("/", response_model=MetricsResponse, status_code=status.HTTP_201_CREATED)
async def create_metrics(metrics_data: MetricsCreate, db: AsyncSession = Depends(get_db)):
    """Submit new metrics."""
    metrics = PartnerMetrics(**metrics_data.model_dump())
    db.add(metrics)
    await db.commit()
    await db.refresh(metrics)
    return metrics


@router.post("/batch", status_code=status.HTTP_201_CREATED)
async def create_metrics_batch(
    metrics_list: List[MetricsCreate],
    db: AsyncSession = Depends(get_db),
):
    """Submit multiple metrics at once."""
    created = []
    for m in metrics_list:
        metrics = PartnerMetrics(**m.model_dump())
        db.add(metrics)
        created.append(metrics)

    await db.commit()

    return {"created": len(created)}
