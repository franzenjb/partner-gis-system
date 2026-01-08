"""Network Analysis Service using NetworkX."""
from typing import List, Tuple, Dict, Any, Optional
import networkx as nx
from networkx.algorithms import community


class NetworkAnalyzer:
    """
    Performs network analysis on the partner collaboration graph.

    Provides:
    - Centrality metrics (degree, betweenness, eigenvector)
    - Community detection
    - Path analysis
    - Connectivity assessment
    - Recommendations for strengthening the network
    """

    def __init__(self):
        self.graph: Optional[nx.Graph] = None

    def build_graph(self, nodes: List[str], edges: List[Tuple[str, str]]) -> nx.Graph:
        """Build a NetworkX graph from nodes and edges."""
        self.graph = nx.Graph()
        self.graph.add_nodes_from(nodes)
        self.graph.add_edges_from(edges)
        return self.graph

    def analyze(self, nodes: List[str], edges: List[Tuple[str, str]]) -> Dict[str, Any]:
        """
        Perform comprehensive network analysis.

        Returns metrics for each node and overall network health indicators.
        """
        self.build_graph(nodes, edges)

        if len(nodes) == 0:
            return {
                "node_metrics": {},
                "network_metrics": {
                    "total_nodes": 0,
                    "total_edges": 0,
                    "density": 0,
                    "is_connected": False,
                    "num_components": 0,
                },
                "communities": [],
            }

        # Calculate centrality metrics
        degree_centrality = nx.degree_centrality(self.graph)
        betweenness_centrality = nx.betweenness_centrality(self.graph)

        # Eigenvector centrality may fail on disconnected graphs
        try:
            eigenvector_centrality = nx.eigenvector_centrality(self.graph, max_iter=1000)
        except nx.PowerIterationFailedConvergence:
            eigenvector_centrality = {n: 0.0 for n in nodes}

        # Community detection using Louvain method
        try:
            communities_generator = community.louvain_communities(self.graph)
            communities_list = list(communities_generator)
        except Exception:
            communities_list = []

        # Create community mapping
        community_map = {}
        for idx, comm in enumerate(communities_list):
            for node in comm:
                community_map[node] = idx

        # Build node metrics
        node_metrics = {}
        for node in nodes:
            node_metrics[node] = {
                "degree_centrality": round(degree_centrality.get(node, 0), 4),
                "betweenness_centrality": round(betweenness_centrality.get(node, 0), 4),
                "eigenvector_centrality": round(eigenvector_centrality.get(node, 0), 4),
                "community_id": community_map.get(node),
                "degree": self.graph.degree(node),
            }

        # Network-level metrics
        network_metrics = {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "density": round(nx.density(self.graph), 4),
            "is_connected": nx.is_connected(self.graph) if len(nodes) > 0 else False,
            "num_components": nx.number_connected_components(self.graph),
            "average_clustering": round(nx.average_clustering(self.graph), 4),
        }

        # Add connectivity metrics if graph is connected
        if network_metrics["is_connected"] and len(nodes) > 1:
            network_metrics["average_path_length"] = round(
                nx.average_shortest_path_length(self.graph), 4
            )
            network_metrics["diameter"] = nx.diameter(self.graph)

        return {
            "node_metrics": node_metrics,
            "network_metrics": network_metrics,
            "communities": [
                {"id": idx, "members": list(comm), "size": len(comm)}
                for idx, comm in enumerate(communities_list)
            ],
        }

    def find_isolated_nodes(self) -> List[str]:
        """Find nodes with no connections."""
        if not self.graph:
            return []
        return [n for n in self.graph.nodes() if self.graph.degree(n) == 0]

    def find_bridges(self) -> List[Tuple[str, str]]:
        """Find edges that, if removed, would disconnect the graph."""
        if not self.graph:
            return []
        return list(nx.bridges(self.graph))

    def recommend_connections(self, top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Recommend new connections that would most improve network connectivity.

        Uses common neighbors and Jaccard coefficient to suggest partnerships.
        """
        if not self.graph or len(self.graph.nodes()) < 2:
            return []

        # Get non-edges (potential connections)
        non_edges = list(nx.non_edges(self.graph))

        # Calculate Jaccard coefficient for potential connections
        predictions = list(nx.jaccard_coefficient(self.graph, non_edges))

        # Sort by coefficient (higher = more likely to benefit from connection)
        predictions.sort(key=lambda x: x[2], reverse=True)

        return [
            {
                "partner_a": pred[0],
                "partner_b": pred[1],
                "score": round(pred[2], 4),
                "reason": "Common neighbors suggest these partners would benefit from direct collaboration",
            }
            for pred in predictions[:top_n]
        ]

    def shortest_path(self, source: str, target: str) -> Optional[List[str]]:
        """Find the shortest path between two partners."""
        if not self.graph:
            return None
        try:
            return nx.shortest_path(self.graph, source, target)
        except nx.NetworkXNoPath:
            return None

    def get_subgraph(self, node: str, depth: int = 2) -> Dict[str, Any]:
        """Get the ego network (local neighborhood) of a node."""
        if not self.graph or node not in self.graph:
            return {"nodes": [], "edges": []}

        ego = nx.ego_graph(self.graph, node, radius=depth)

        return {
            "nodes": list(ego.nodes()),
            "edges": list(ego.edges()),
            "center": node,
            "depth": depth,
        }
