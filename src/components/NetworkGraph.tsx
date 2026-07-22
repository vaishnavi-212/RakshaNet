import React, { useEffect, useRef, useState } from "react";
import { EntityNode, EntityEdge, Session } from "../types.ts";
import { 
  ShieldAlert, 
  Smartphone, 
  Globe, 
  Landmark, 
  FileText, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  AlertCircle,
  Network,
  X,
  Plus
} from "lucide-react";

interface SimNode extends EntityNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
}

interface NetworkGraphProps {
  onSelectNode?: (nodeId: string) => void;
}

export default function NetworkGraph({ onSelectNode }: NetworkGraphProps = {}) {
  const [graphData, setGraphData] = useState<{ nodes: EntityNode[]; edges: EntityEdge[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLegendFilter, setActiveLegendFilter] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Simulation State
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingNodeRef = useRef<string | null>(null);
  const gRef = useRef<SVGGElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Sync ref with state for any simulation loop reads
  useEffect(() => {
    draggingNodeRef.current = draggingNodeId;
  }, [draggingNodeId]);

  // Fetch graph data on mount
  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/network-graph");
      if (!res.ok) throw new Error("Failed to load network graph data");
      const data = await res.json();
      setGraphData(data);

      // Initialize simulation node positions randomly around center
      const width = 800;
      const height = 500;
      const initialized: SimNode[] = data.nodes.map((node: EntityNode, index: number) => {
        const angle = (index / data.nodes.length) * 2 * Math.PI;
        const radius = 150 + Math.random() * 100;
        return {
          ...node,
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          fx: null,
          fy: null
        };
      });
      setSimNodes(initialized);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  // Simulation Loop
  useEffect(() => {
    if (simNodes.length === 0 || !graphData) return;

    let animationId: number;
    const width = 800;
    const height = 500;

    const tick = () => {
      setSimNodes((prevNodes) => {
        const nextNodes = prevNodes.map(n => ({ ...n }));
        const nodeMap = new Map<string, SimNode>(nextNodes.map(n => [n.id, n]));

        const repulsionStrength = 5800;
        const linkStrength = 0.04;
        const centerStrength = 0.02;
        const damping = 0.85;

        // 1. Repulsion forces & collision separation (prevents node overlaps)
        for (let i = 0; i < nextNodes.length; i++) {
          const n1 = nextNodes[i];
          for (let j = i + 1; j < nextNodes.length; j++) {
            const n2 = nextNodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy + 0.01;
            const dist = Math.sqrt(distSq);

            // Minimum collision distance between node centers to guarantee no icon/label overlap
            const minDist = 95;
            if (dist < minDist) {
              const overlap = (minDist - dist) * 0.5;
              const nx = dx / dist;
              const ny = dy / dist;
              if (n1.fx === null) {
                n1.x -= nx * overlap;
                n1.y -= ny * overlap;
              }
              if (n2.fx === null) {
                n2.x += nx * overlap;
                n2.y += ny * overlap;
              }
            }

            if (dist < 320) {
              const force = repulsionStrength / distSq;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (n1.fx === null) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (n2.fx === null) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // 2. Link attraction forces
        graphData.edges.forEach((edge) => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);

          if (sourceNode && targetNode) {
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
            const restLength = 160;
            const force = (dist - restLength) * linkStrength;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (sourceNode.fx === null) {
              sourceNode.vx += fx;
              sourceNode.vy += fy;
            }
            if (targetNode.fx === null) {
              targetNode.vx -= fx;
              targetNode.vy -= fy;
            }
          }
        });

        // 3. Center gravity and update positions
        nextNodes.forEach((node) => {
          if (node.fx !== null) {
            node.x = node.fx;
            node.y = node.fy;
            node.vx = 0;
            node.vy = 0;
            return;
          }

          const dx = width / 2 - node.x;
          const dy = height / 2 - node.y;
          node.vx += dx * centerStrength;
          node.vy += dy * centerStrength;

          node.vx *= damping;
          node.vy *= damping;
          node.x += node.vx;
          node.y += node.vy;

          // Constraints within SVG bounding box
          node.x = Math.max(45, Math.min(width - 45, node.x));
          node.y = Math.max(45, Math.min(height - 45, node.y));
        });

        return nextNodes;
      });

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [graphData]);

  // Context ref to avoid recreating mousemove/mouseup event listeners on every frame/pixel movement
  const dragContextRef = useRef({
    draggingNodeId: null as string | null,
    isPanning: false,
    panStart: { x: 0, y: 0 },
    pan: { x: 0, y: 0 },
    zoom: 1
  });

  useEffect(() => {
    dragContextRef.current = {
      draggingNodeId,
      isPanning,
      panStart,
      pan,
      zoom
    };
  }, [draggingNodeId, isPanning, panStart, pan, zoom]);

  useEffect(() => {
    if (!draggingNodeId && !isPanning) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const ctx = dragContextRef.current;
      const width = 800;
      const height = 500;

      if (ctx.draggingNodeId && containerRef.current) {
        let svgX = 0;
        let svgY = 0;
        const svgElement = containerRef.current.querySelector("svg");
        if (svgElement && gRef.current) {
          try {
            const point = svgElement.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            const svgPoint = point.matrixTransform(gRef.current.getScreenCTM()!.inverse());
            svgX = svgPoint.x - dragOffsetRef.current.x;
            svgY = svgPoint.y - dragOffsetRef.current.y;
          } catch (err) {
            const rect = containerRef.current.getBoundingClientRect();
            const rawX = e.clientX - rect.left;
            const rawY = e.clientY - rect.top;
            svgX = (rawX - ctx.pan.x) / ctx.zoom - dragOffsetRef.current.x;
            svgY = (rawY - ctx.pan.y) / ctx.zoom - dragOffsetRef.current.y;
          }
        } else {
          const rect = containerRef.current.getBoundingClientRect();
          const rawX = e.clientX - rect.left;
          const rawY = e.clientY - rect.top;
          svgX = (rawX - ctx.pan.x) / ctx.zoom - dragOffsetRef.current.x;
          svgY = (rawY - ctx.pan.y) / ctx.zoom - dragOffsetRef.current.y;
        }

        // Strict boundary clamping so nodes can never escape the viewBox during active drag
        const margin = 40;
        svgX = Math.max(margin, Math.min(width - margin, svgX));
        svgY = Math.max(margin, Math.min(height - margin, svgY));

        setSimNodes((prev) =>
          prev.map((n) =>
            n.id === ctx.draggingNodeId ? { ...n, fx: svgX, fy: svgY, x: svgX, y: svgY } : n
          )
        );
      } else if (ctx.isPanning) {
        const dx = e.clientX - ctx.panStart.x;
        const dy = e.clientY - ctx.panStart.y;
        setPan({ x: dx, y: dy });
      }
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      const ctx = dragContextRef.current;
      if (ctx.draggingNodeId || ctx.isPanning) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (ctx.draggingNodeId) {
        const id = ctx.draggingNodeId;
        setSimNodes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, fx: null, fy: null } : n))
        );
        setDraggingNodeId(null);
      }
      if (ctx.isPanning) {
        setIsPanning(false);
      }
    };

    // Use capturing listeners to guarantee intercepts are cleanly handled and cleaned up
    window.addEventListener("mousemove", handleWindowMouseMove, { capture: true });
    window.addEventListener("mouseup", handleWindowMouseUp, { capture: true });

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove, { capture: true });
      window.removeEventListener("mouseup", handleWindowMouseUp, { capture: true });
    };
  }, [draggingNodeId !== null, isPanning]);

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<any>, node: SimNode) => {
    e.stopPropagation();
    e.preventDefault(); // Stop native text selection or HTML drag-and-drop
    setDraggingNodeId(node.id);

    let clickX = node.x;
    let clickY = node.y;

    if (containerRef.current && gRef.current) {
      const svgElement = containerRef.current.querySelector("svg");
      if (svgElement) {
        try {
          const point = svgElement.createSVGPoint();
          point.x = e.clientX;
          point.y = e.clientY;
          const svgPoint = point.matrixTransform(gRef.current.getScreenCTM()!.inverse());
          clickX = svgPoint.x;
          clickY = svgPoint.y;
        } catch (err) {
          const rect = containerRef.current.getBoundingClientRect();
          const rawX = e.clientX - rect.left;
          const rawY = e.clientY - rect.top;
          clickX = (rawX - pan.x) / zoom;
          clickY = (rawY - pan.y) / zoom;
        }
      }
    }

    dragOffsetRef.current = {
      x: clickX - node.x,
      y: clickY - node.y
    };

    setSimNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, fx: n.x, fy: n.y } : n))
    );
  };

  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Only pan on left click
    e.preventDefault(); // Stop text highlight/page-level drag gestures
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Node Styling Helpers
  const getNodeColor = (type: string, isShared: boolean) => {
    if (type === "session") return "fill-indigo-600 stroke-indigo-400";
    if (isShared) return "fill-amber-500 stroke-amber-400 shadow-amber-500/50";
    if (type === "upi") return "fill-rose-600 stroke-rose-400";
    if (type === "phone") return "fill-emerald-600 stroke-emerald-400";
    if (type === "bank_account") return "fill-yellow-600 stroke-yellow-400";
    if (type === "url") return "fill-sky-600 stroke-sky-400";
    return "fill-slate-600 stroke-slate-400";
  };

  const getNodeIcon = (type: string) => {
    if (type === "session") return <FileText className="w-3.5 h-3.5 text-white" />;
    if (type === "upi") return <Landmark className="w-3.5 h-3.5 text-white" />;
    if (type === "phone") return <Smartphone className="w-3.5 h-3.5 text-white" />;
    if (type === "bank_account") return <Landmark className="w-3.5 h-3.5 text-white" />;
    if (type === "url") return <Globe className="w-3.5 h-3.5 text-white" />;
    return <AlertCircle className="w-3.5 h-3.5 text-white" />;
  };

  // Node Filtering
  const filteredNodes = simNodes.filter((n) => {
    if (!searchQuery) return true;
    return n.value.toLowerCase().includes(searchQuery.toLowerCase()) || n.type.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-mono text-slate-300">
      {/* Simulation/Graph Canvas */}
      <div className="xl:col-span-2 flex flex-col bg-slate-950/40 border border-white/10 rounded-2xl overflow-hidden relative h-[480px]">
        {/* Top Graph Controls Bar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button 
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} 
              className="p-1.5 bg-slate-900/90 border border-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer shadow-md"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} 
              className="p-1.5 bg-slate-900/90 border border-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer shadow-md"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setActiveLegendFilter(null); setSearchQuery(""); }} 
              className="p-1.5 bg-slate-900/90 border border-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer shadow-md"
              title="Reset View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="pointer-events-auto min-w-0">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search indicators..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-36 sm:w-64 bg-slate-900/90 border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-500 shadow-md"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/95 border border-white/10 p-2.5 rounded-xl text-[10px] space-y-1 max-w-[210px] shadow-lg backdrop-blur-md select-none">
          <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
            <h4 className="font-bold text-white uppercase tracking-wider text-[9px]">Network Legend</h4>
            {activeLegendFilter && (
              <button
                onClick={() => setActiveLegendFilter(null)}
                className="text-[9px] text-teal-400 hover:underline cursor-pointer font-sans"
              >
                Reset
              </button>
            )}
          </div>

          <div 
            onClick={() => setActiveLegendFilter(activeLegendFilter === "session" ? null : "session")}
            className={`flex items-center justify-between gap-1.5 p-1 rounded transition cursor-pointer ${
              activeLegendFilter === "session" ? "bg-indigo-500/20 ring-1 ring-indigo-500/50" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-indigo-400 flex-shrink-0"></span>
              <span className={activeLegendFilter === "session" ? "text-white font-bold" : "text-slate-300"}>Citizen Report</span>
            </div>
            {activeLegendFilter === "session" && <span className="text-indigo-400 text-[8px] font-bold">ACTIVE</span>}
          </div>

          <div 
            onClick={() => setActiveLegendFilter(activeLegendFilter === "shared" ? null : "shared")}
            className={`flex items-center justify-between gap-1.5 p-1 rounded transition cursor-pointer ${
              activeLegendFilter === "shared" ? "bg-amber-500/20 ring-1 ring-amber-500/50" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-400 flex-shrink-0"></span>
              <span className={activeLegendFilter === "shared" ? "text-amber-300 font-bold" : "text-slate-300"}>Shared Indicator</span>
            </div>
            {activeLegendFilter === "shared" && <span className="text-amber-400 text-[8px] font-bold">ACTIVE</span>}
          </div>

          <div 
            onClick={() => setActiveLegendFilter(activeLegendFilter === "upi" ? null : "upi")}
            className={`flex items-center justify-between gap-1.5 p-1 rounded transition cursor-pointer ${
              activeLegendFilter === "upi" ? "bg-rose-500/20 ring-1 ring-rose-500/50" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-rose-400 flex-shrink-0"></span>
              <span className={activeLegendFilter === "upi" ? "text-white font-bold" : "text-slate-300"}>UPI ID Node</span>
            </div>
            {activeLegendFilter === "upi" && <span className="text-rose-400 text-[8px] font-bold">ACTIVE</span>}
          </div>

          <div 
            onClick={() => setActiveLegendFilter(activeLegendFilter === "phone" ? null : "phone")}
            className={`flex items-center justify-between gap-1.5 p-1 rounded transition cursor-pointer ${
              activeLegendFilter === "phone" ? "bg-emerald-500/20 ring-1 ring-emerald-500/50" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-emerald-400 flex-shrink-0"></span>
              <span className={activeLegendFilter === "phone" ? "text-white font-bold" : "text-slate-300"}>Phone Number</span>
            </div>
            {activeLegendFilter === "phone" && <span className="text-emerald-400 text-[8px] font-bold">ACTIVE</span>}
          </div>

          <div 
            onClick={() => setActiveLegendFilter(activeLegendFilter === "bank_account" ? null : "bank_account")}
            className={`flex items-center justify-between gap-1.5 p-1 rounded transition cursor-pointer ${
              activeLegendFilter === "bank_account" ? "bg-yellow-500/20 ring-1 ring-yellow-500/50" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-600 border border-yellow-400 flex-shrink-0"></span>
              <span className={activeLegendFilter === "bank_account" ? "text-white font-bold" : "text-slate-300"}>Bank Account</span>
            </div>
            {activeLegendFilter === "bank_account" && <span className="text-yellow-400 text-[8px] font-bold">ACTIVE</span>}
          </div>

          <div 
            onClick={() => setActiveLegendFilter(activeLegendFilter === "url" ? null : "url")}
            className={`flex items-center justify-between gap-1.5 p-1 rounded transition cursor-pointer ${
              activeLegendFilter === "url" ? "bg-sky-500/20 ring-1 ring-sky-500/50" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 border border-sky-400 flex-shrink-0"></span>
              <span className={activeLegendFilter === "url" ? "text-white font-bold" : "text-slate-300"}>URL / Web Node</span>
            </div>
            {activeLegendFilter === "url" && <span className="text-sky-400 text-[8px] font-bold">ACTIVE</span>}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-2">
            <Network className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-xs text-slate-400">Synthesizing threat database networks...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 text-rose-400">
            <ShieldAlert className="w-8 h-8" />
            <span className="text-xs font-bold uppercase">Intelligence Synthesis Failed</span>
            <span className="text-[10px] text-slate-500 max-w-xs leading-relaxed">{error}</span>
          </div>
        ) : (
          <div ref={containerRef} className="flex-1 relative cursor-grab active:cursor-grabbing w-full h-full overflow-hidden flex items-center justify-center">
            <svg 
              className="w-full h-full"
              viewBox="0 0 800 500"
              preserveAspectRatio="xMidYMid meet"
              onMouseDown={handleSvgMouseDown}
            >
              <defs>
                <pattern id="dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.06)" />
                </pattern>
                {/* Glow filter for shared indicators */}
                <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#dot-grid)" />

              <g ref={gRef} transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Edges */}
                {graphData?.edges.map((edge, index) => {
                  const src = simNodes.find((n) => n.id === edge.source);
                  const tgt = simNodes.find((n) => n.id === edge.target);
                  if (!src || !tgt) return null;

                  const isHighlit = selectedNode && (selectedNode.id === src.id || selectedNode.id === tgt.id);
                  const isSharedIndicatorEdge = tgt.sessionIds.length > 1;

                  return (
                    <line
                      key={index}
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      className={`transition-colors duration-300 ${
                        isHighlit 
                          ? "stroke-indigo-400 stroke-[2.5px]" 
                          : isSharedIndicatorEdge
                          ? "stroke-amber-500/40 stroke-[1.5px] stroke-dasharray-[2,2]"
                          : "stroke-white/10 stroke-[1px]"
                      }`}
                    />
                  );
                })}

                {/* Nodes */}
                {filteredNodes.map((node, nodeIdx) => {
                  const isShared = node.type !== "session" && node.sessionIds.length > 1;
                  const isSelected = selectedNode?.id === node.id;
                  const isSearched = searchQuery && node.value.toLowerCase().includes(searchQuery.toLowerCase());

                  const isLegendActive = activeLegendFilter !== null;
                  const isLegendMatch =
                    activeLegendFilter === "shared"
                      ? isShared
                      : activeLegendFilter === node.type;

                  const isDimmed = isLegendActive && !isLegendMatch;

                  // Stagger label positions (top vs bottom) based on node type and index to prevent label collisions
                  const isTopLabel = node.type !== "session" && nodeIdx % 2 === 1;
                  const labelY = isTopLabel ? -20 : (node.type === "session" ? 28 : 26);

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseDown={(e) => handleMouseDown(e as any, node)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                        if (onSelectNode) {
                          onSelectNode(node.id);
                        }
                      }}
                      className={`cursor-pointer transition-opacity duration-300 ${isDimmed ? "opacity-30" : "opacity-100"}`}
                    >
                      {/* Active Indicator Glimmer */}
                      {isShared && (
                        <circle
                          r={isSelected ? 26 : 22}
                          className="fill-none stroke-amber-500/40 animate-ping stroke-[1.5px]"
                          style={{ animationDuration: "2.5s" }}
                        />
                      )}

                      {/* Selection / Search / Legend Glow Ring */}
                      {(isSelected || isSearched || (isLegendActive && isLegendMatch)) && (
                        <circle
                          r={25}
                          className={`fill-none ${
                            isSearched
                              ? "stroke-teal-400/80"
                              : isLegendMatch
                              ? "stroke-amber-400/80"
                              : "stroke-indigo-400/80"
                          } stroke-[3px] animate-pulse`}
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={node.type === "session" ? 15 : 13}
                        className={`${getNodeColor(node.type, isShared)} transition-all duration-300 ${
                          isShared ? "filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : ""
                        }`}
                        filter={isShared ? "url(#glow-amber)" : undefined}
                      />

                      {/* Node Center Icons */}
                      <g transform="translate(-7, -7)" className="pointer-events-none">
                        {getNodeIcon(node.type)}
                      </g>

                      {/* Ultra-readable text labeling with stroke halo */}
                      <text
                        y={labelY}
                        textAnchor="middle"
                        className={`text-[9px] font-bold tracking-wide transition-colors duration-300 select-none ${
                          isSelected 
                            ? "fill-white font-extrabold" 
                            : isShared
                            ? "fill-amber-300 font-bold"
                            : "fill-slate-200"
                        }`}
                        style={{
                          pointerEvents: "none",
                          paintOrder: "stroke fill",
                          stroke: "#030712",
                          strokeWidth: "3.5px",
                          strokeLinejoin: "round"
                        }}
                      >
                        {node.type === "session" 
                          ? node.id 
                          : node.value.length > 15 
                          ? `${node.value.slice(0, 13)}...` 
                          : node.value}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        )}
      </div>

      {/* Inspector Panel */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-xl backdrop-blur-md h-[480px]">
        {selectedNode ? (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 animate-in fade-in duration-300">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${
                  selectedNode.type === "session" 
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : selectedNode.sessionIds.length > 1
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                    : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                }`}>
                  {selectedNode.type === "session" ? "Scam Report" : `${selectedNode.type} Node`}
                </span>
                <h3 className="text-xs font-extrabold text-white mt-1 break-all uppercase tracking-wide">
                  {selectedNode.type === "session" ? selectedNode.id : selectedNode.value}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedNode.type === "session" ? (
              <div className="space-y-3.5 text-[11px]">
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-widest">Description</h4>
                  <p className="text-slate-200 mt-1 leading-normal bg-black/20 p-2.5 rounded-lg border border-white/5">
                    {selectedNode.value}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-widest">Session ID</h4>
                  <p className="text-slate-300 font-mono mt-1">{selectedNode.firstSeenSessionId}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-[11px]">
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-widest">Linked Indicator Value</h4>
                  <p className="text-white mt-1 leading-normal font-bold bg-black/20 p-2.5 rounded-lg border border-white/5 break-all">
                    {selectedNode.value}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-widest">Co-occurrence Severity</h4>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      selectedNode.sessionIds.length > 1 
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/20" 
                        : "bg-slate-500/10 text-slate-400"
                    }`}>
                      {selectedNode.sessionIds.length > 1 ? "HIGH RISK SYNDICATE" : "ISOLATED INCIDENT"}
                    </span>
                    <span className="text-slate-400">Shared by {selectedNode.sessionIds.length} reports</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Connected Scam Reports</h4>
                  <div className="space-y-2">
                    {selectedNode.sessionIds.map((sid) => (
                      <div 
                        key={sid}
                        className="bg-black/20 border border-white/5 rounded-xl p-3 flex justify-between items-center hover:border-indigo-500/30 transition cursor-pointer"
                        onClick={() => {
                          const matchingNode = simNodes.find(sn => sn.id === sid);
                          if (matchingNode) {
                            setSelectedNode(matchingNode);
                            if (onSelectNode) {
                              onSelectNode(matchingNode.id);
                            }
                          }
                        }}
                      >
                        <div>
                          <p className="font-bold text-slate-200">{sid}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5 uppercase">Target coordinates isolated</p>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Network className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase">Interactive Deep Inspection</h4>
              <p className="text-[10px] text-slate-500 max-w-[200px] leading-relaxed mt-1">
                Click any node in the fraud network graph to trace co-occurring indicators, view transaction hubs, or isolate active campaigns.
              </p>
            </div>
          </div>
        )}

        {/* Telemetry Footer inside Inspector card */}
        {graphData && (
          <div className="border-t border-white/5 pt-3.5 mt-3.5 text-[9px] text-slate-500 space-y-1 bg-slate-900/40 p-2.5 rounded-xl border border-white/5 font-mono">
            <div className="flex justify-between">
              <span>Threat Corpus Size:</span>
              <span className="text-slate-300 font-semibold">{graphData.nodes.filter(n => n.type === "session").length} Reports</span>
            </div>
            <div className="flex justify-between">
              <span>Isolated Indicators:</span>
              <span className="text-slate-300 font-semibold">{graphData.nodes.filter(n => n.type !== "session").length} Elements</span>
            </div>
            <div className="flex justify-between">
              <span>Shared Syndicate Hubs:</span>
              <span className="text-amber-400 font-bold">{graphData.nodes.filter(n => n.type !== "session" && n.sessionIds.length > 1).length} Clusters</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
