"""Partner Network & Collaboration endpoints with NetworkX analysis."""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.network import PartnerNetwork, RelationshipType, RelationshipContext
from ..models.partner import Partner
from ..schemas import NetworkEdgeCreate, NetworkEdgeResponse, NetworkAnalysisResult
from ..services.network_analysis import NetworkAnalyzer

router = APIRouter()


@router.get("/edges", response_model=List[NetworkEdgeResponse])
async def list_network_edges(
    partner_id: Optional[str] = None,
    relationship_type: Optional[RelationshipType] = None,
    context: Optional[RelationshipContext] = None,
    db: AsyncSession = Depends(get_db),
):
    """List all network edges (relationships)."""
    query = select(PartnerNetwork)

    if partner_id:
        try:
            pid = uuid.UUID(partner_id)
            query = query.where(
                or_(
                    PartnerNetwork.partner_a_id == pid,
                    PartnerNetwork.partner_b_id == pid,
                )
            )
        except ValueError:
            pass

    if relationship_type:
        query = query.where(PartnerNetwork.relationship_type == relationship_type)

    if context:
        query = query.where(
            or_(
                PartnerNetwork.relationship_context == context,
                PartnerNetwork.relationship_context == RelationshipContext.BOTH,
            )
        )

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/graph")
async def get_network_graph(
    context: Optional[RelationshipContext] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Get full network graph data for visualization.
    Returns nodes (partners) and edges (relationships) in a format
    suitable for Cytoscape.js or D3.js.
    """
    # Get all partners
    partner_query = select(Partner).where(Partner.is_active == True)
    partner_result = await db.execute(partner_query)
    partners = partner_result.scalars().all()

    # Get all edges
    edge_query = select(PartnerNetwork)
    if context:
        edge_query = edge_query.where(
            or_(
                PartnerNetwork.relationship_context == context,
                PartnerNetwork.relationship_context == RelationshipContext.BOTH,
            )
        )
    edge_result = await db.execute(edge_query)
    edges = edge_result.scalars().all()

    # Build graph structure
    nodes = [
        {
            "data": {
                "id": str(p.id),
                "label": p.organization_name,
                "type": p.organization_type.value if p.organization_type else "unknown",
                "partner_id": p.partner_id,
            }
        }
        for p in partners
    ]

    edge_list = [
        {
            "data": {
                "id": str(e.id),
                "source": str(e.partner_a_id),
                "target": str(e.partner_b_id),
                "relationship": e.relationship_type.value,
                "strength": e.relationship_strength.value,
                "context": e.relationship_context.value,
            }
        }
        for e in edges
    ]

    return {
        "nodes": nodes,
        "edges": edge_list,
        "summary": {
            "total_nodes": len(nodes),
            "total_edges": len(edge_list),
        },
    }


@router.get("/analysis")
async def analyze_network(
    context: Optional[RelationshipContext] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Perform network analysis using NetworkX.
    Returns centrality metrics and community detection results.
    """
    # Get partners and edges
    partner_query = select(Partner).where(Partner.is_active == True)
    partner_result = await db.execute(partner_query)
    partners = partner_result.scalars().all()

    edge_query = select(PartnerNetwork)
    if context:
        edge_query = edge_query.where(
            or_(
                PartnerNetwork.relationship_context == context,
                PartnerNetwork.relationship_context == RelationshipContext.BOTH,
            )
        )
    edge_result = await db.execute(edge_query)
    edges = edge_result.scalars().all()

    # Build partner lookup
    partner_lookup = {str(p.id): p.organization_name for p in partners}

    # Run analysis
    analyzer = NetworkAnalyzer()
    analysis = analyzer.analyze(
        nodes=[str(p.id) for p in partners],
        edges=[(str(e.partner_a_id), str(e.partner_b_id)) for e in edges],
    )

    # Format results
    results = []
    for node_id, metrics in analysis["node_metrics"].items():
        results.append({
            "partner_id": node_id,
            "partner_name": partner_lookup.get(node_id, "Unknown"),
            "degree_centrality": metrics["degree_centrality"],
            "betweenness_centrality": metrics["betweenness_centrality"],
            "eigenvector_centrality": metrics["eigenvector_centrality"],
            "community_id": metrics.get("community_id"),
            "is_isolated": metrics["degree_centrality"] == 0,
        })

    # Sort by betweenness centrality (most critical bridges first)
    results.sort(key=lambda x: x["betweenness_centrality"], reverse=True)

    return {
        "node_analysis": results,
        "network_metrics": analysis["network_metrics"],
        "communities": analysis["communities"],
        "isolated_nodes": [r for r in results if r["is_isolated"]],
        "key_bridges": results[:10],  # Top 10 most central partners
    }


@router.get("/partner/{partner_id}/connections")
async def get_partner_connections(
    partner_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all connections for a specific partner."""
    try:
        pid = uuid.UUID(partner_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid partner ID")

    # Get edges where this partner is involved
    edge_query = select(PartnerNetwork).where(
        or_(
            PartnerNetwork.partner_a_id == pid,
            PartnerNetwork.partner_b_id == pid,
        )
    )
    edge_result = await db.execute(edge_query)
    edges = edge_result.scalars().all()

    # Get connected partner IDs
    connected_ids = set()
    for e in edges:
        if str(e.partner_a_id) != partner_id:
            connected_ids.add(e.partner_a_id)
        if str(e.partner_b_id) != partner_id:
            connected_ids.add(e.partner_b_id)

    # Get partner info
    if connected_ids:
        partner_query = select(Partner).where(Partner.id.in_(connected_ids))
        partner_result = await db.execute(partner_query)
        connected_partners = partner_result.scalars().all()
    else:
        connected_partners = []

    return {
        "partner_id": partner_id,
        "total_connections": len(edges),
        "connections": [
            {
                "edge_id": str(e.id),
                "partner_id": str(e.partner_b_id if str(e.partner_a_id) == partner_id else e.partner_a_id),
                "relationship_type": e.relationship_type.value,
                "strength": e.relationship_strength.value,
                "context": e.relationship_context.value,
            }
            for e in edges
        ],
        "connected_partners": [
            {
                "id": str(p.id),
                "name": p.organization_name,
                "type": p.organization_type.value if p.organization_type else None,
            }
            for p in connected_partners
        ],
    }


@router.post("/edges", response_model=NetworkEdgeResponse, status_code=status.HTTP_201_CREATED)
async def create_network_edge(
    edge_data: NetworkEdgeCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new network relationship between two partners."""
    # Verify both partners exist
    for pid in [edge_data.partner_a_id, edge_data.partner_b_id]:
        result = await db.execute(select(Partner).where(Partner.id == pid))
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail=f"Partner {pid} not found")

    edge = PartnerNetwork(**edge_data.model_dump())
    db.add(edge)
    await db.commit()
    await db.refresh(edge)
    return edge


@router.delete("/edges/{edge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_network_edge(edge_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a network relationship."""
    try:
        eid = uuid.UUID(edge_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid edge ID")

    result = await db.execute(select(PartnerNetwork).where(PartnerNetwork.id == eid))
    edge = result.scalar_one_or_none()

    if not edge:
        raise HTTPException(status_code=404, detail="Edge not found")

    await db.delete(edge)
    await db.commit()
