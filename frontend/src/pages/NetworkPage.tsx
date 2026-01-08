import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import cytoscape from 'cytoscape'
import { networkApi } from '../api/client'

export default function NetworkPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  // Fetch network graph
  const { data: graphData, isLoading: graphLoading } = useQuery({
    queryKey: ['network', 'graph'],
    queryFn: () => networkApi.getGraph(),
  })

  // Fetch network analysis
  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['network', 'analysis'],
    queryFn: () => networkApi.getAnalysis(),
  })

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || !graphData) return

    // Transform data for Cytoscape
    const elements = [
      ...graphData.nodes.map((n) => ({
        data: {
          ...n.data,
          // Size based on centrality if available
          size:
            analysis?.node_analysis.find((a) => a.partner_id === n.data.id)
              ?.degree_centrality || 0.1,
        },
      })),
      ...graphData.edges.map((e) => ({
        data: e.data,
      })),
    ]

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#ed1c24',
            label: 'data(label)',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            width: 'mapData(size, 0, 1, 20, 60)',
            height: 'mapData(size, 0, 1, 20, 60)',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#f97316',
            'border-width': 3,
            'border-color': '#333',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#ccc',
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#f97316',
            width: 3,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 1000,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 100,
      },
    })

    // Click handler
    cyRef.current.on('tap', 'node', (evt) => {
      const nodeId = evt.target.id()
      setSelectedNode(nodeId)
    })

    cyRef.current.on('tap', (evt) => {
      if (evt.target === cyRef.current) {
        setSelectedNode(null)
      }
    })

    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
  }, [graphData, analysis])

  // Get selected node details
  const selectedNodeAnalysis = selectedNode
    ? analysis?.node_analysis.find((n) => n.partner_id === selectedNode)
    : null

  return (
    <div className="flex h-full">
      {/* Graph visualization */}
      <div className="flex-1 relative">
        {graphLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading network...</div>
          </div>
        ) : (
          <div ref={containerRef} className="w-full h-full bg-gray-50" />
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Network Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rc-red rounded-full" />
              <span className="text-gray-600">Partner Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-400" />
              <span className="text-gray-600">Relationship</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Node size = centrality</p>
          </div>
        </div>

        {/* Stats overlay */}
        {analysis && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Network Health</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-gray-500">Nodes:</span>
                <span className="ml-2 font-medium">{analysis.network_metrics.total_nodes}</span>
              </div>
              <div>
                <span className="text-gray-500">Edges:</span>
                <span className="ml-2 font-medium">{analysis.network_metrics.total_edges}</span>
              </div>
              <div>
                <span className="text-gray-500">Density:</span>
                <span className="ml-2 font-medium">
                  {(analysis.network_metrics.density * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-500">Communities:</span>
                <span className="ml-2 font-medium">{analysis.communities.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Analysis details */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Network Analysis</h2>

          {/* Selected node details */}
          {selectedNodeAnalysis ? (
            <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-gray-800 mb-2">
                {selectedNodeAnalysis.partner_name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Degree Centrality:</span>
                  <span className="font-medium">
                    {(selectedNodeAnalysis.degree_centrality * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Betweenness:</span>
                  <span className="font-medium">
                    {(selectedNodeAnalysis.betweenness_centrality * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Eigenvector:</span>
                  <span className="font-medium">
                    {(selectedNodeAnalysis.eigenvector_centrality * 100).toFixed(1)}%
                  </span>
                </div>
                {selectedNodeAnalysis.community_id !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Community:</span>
                    <span className="font-medium">#{selectedNodeAnalysis.community_id}</span>
                  </div>
                )}
                {selectedNodeAnalysis.is_isolated && (
                  <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                    Isolated - No connections
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-6">
              Click a node to see details
            </p>
          )}

          {/* Key bridges */}
          {analysis && analysis.key_bridges.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Key Bridge Partners</h3>
              <p className="text-xs text-gray-500 mb-2">
                Most central partners connecting different parts of the network
              </p>
              <div className="space-y-2">
                {analysis.key_bridges.slice(0, 5).map((partner, i) => (
                  <div
                    key={partner.partner_id}
                    className="p-2 bg-gray-50 rounded text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedNode(partner.partner_id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">#{i + 1}</span>
                      <span className="font-medium text-gray-700 truncate">
                        {partner.partner_name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Betweenness: {(partner.betweenness_centrality * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Isolated nodes */}
          {analysis && analysis.isolated_nodes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Isolated Partners
                <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                  {analysis.isolated_nodes.length}
                </span>
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Partners with no network connections
              </p>
              <div className="space-y-1">
                {analysis.isolated_nodes.slice(0, 5).map((partner) => (
                  <div
                    key={partner.partner_id}
                    className="p-2 bg-red-50 rounded text-sm cursor-pointer hover:bg-red-100"
                    onClick={() => setSelectedNode(partner.partner_id)}
                  >
                    {partner.partner_name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Communities */}
          {analysis && analysis.communities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Communities</h3>
              <p className="text-xs text-gray-500 mb-2">
                Groups of closely connected partners
              </p>
              <div className="space-y-2">
                {analysis.communities.map((comm) => (
                  <div key={comm.id} className="p-2 bg-gray-50 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Community {comm.id + 1}</span>
                      <span className="text-xs text-gray-500">{comm.size} members</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
