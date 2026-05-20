import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Layers,
  GitBranch,
  Zap,
  Eye,
  Circle,
  Clock,
  ChevronRight,
  Send,
  Trash2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Network,
  Plus,
  Minus,
  Maximize2,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";
import { toast } from "@/hooks/use-toast";
import {
  knowledgeGraphApi,
  type KGStats,
  type KGExtraction,
  type KGVisualization,
  type KGVisualizationNode,
  type KGVisualizationEdge,
} from "@/services/api";

// ─── Constants ───────────────────────────────────────────────────────

const NODE_TYPE_COLORS: Record<string, { fill: string; bg: string; ring: string }> = {
  concept: { fill: "#10b981", bg: "bg-emerald-400", ring: "ring-emerald-300" },
  person: { fill: "#3b82f6", bg: "bg-blue-400", ring: "ring-blue-300" },
  project: { fill: "#8b5cf6", bg: "bg-violet-400", ring: "ring-violet-300" },
  document: { fill: "#f59e0b", bg: "bg-amber-400", ring: "ring-amber-300" },
  event: { fill: "#ec4899", bg: "bg-pink-400", ring: "ring-pink-300" },
  organization: { fill: "#6366f1", bg: "bg-indigo-400", ring: "ring-indigo-300" },
  location: { fill: "#14b8a6", bg: "bg-teal-400", ring: "ring-teal-300" },
  resource: { fill: "#ef4444", bg: "bg-red-400", ring: "ring-red-300" },
};

const FALLBACK_COLOR = { fill: "#94a3b8", bg: "bg-slate-400", ring: "ring-slate-300" };

const colorFor = (type: string) =>
  NODE_TYPE_COLORS[type?.toLowerCase()] || FALLBACK_COLOR;

const ACTIONS = [
  {
    key: "extract" as const,
    label: "Extract Knowledge",
    description: "Pull entities and relationships from text",
    icon: Zap,
    color: "from-fuchsia-500 to-purple-600",
  },
  {
    key: "discover" as const,
    label: "Discover Relations",
    description: "Find new connections between focus areas",
    icon: GitBranch,
    color: "from-blue-500 to-indigo-600",
  },
  {
    key: "fill_gaps" as const,
    label: "Fill Gaps",
    description: "Identify and propose missing knowledge",
    icon: Layers,
    color: "from-emerald-500 to-teal-600",
  },
  {
    key: "visualize" as const,
    label: "Refresh View",
    description: "Recompute the layout from your latest data",
    icon: Eye,
    color: "from-amber-500 to-orange-600",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────

function relativeTime(iso?: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const seconds = Math.max(0, (Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function parseFocusInput(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function extractErrorMessage(err: any): string {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong"
  );
}

// ─── Node picker (autocomplete) ──────────────────────────────────────

interface NodeOption {
  id: string;
  label: string;
  type: string;
}

interface NodePickerProps {
  value: NodeOption | null;
  onChange: (option: NodeOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

const NodePicker: React.FC<NodePickerProps> = ({
  value,
  onChange,
  placeholder = "Type to search nodes…",
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [matches, setMatches] = useState<NodeOption[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Debounced search.  The backend `search` query type matches against
  // node labels case-insensitively, which is exactly what we want.
  useEffect(() => {
    const term = input.trim();
    if (!term || term.length < 1) {
      setMatches([]);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await knowledgeGraphApi.query({
          query_type: "search",
          query: { term, limit: 25 },
        });
        if (cancelled) return;
        // Peel the agent + orchestrator wrappers, then grab the
        // `matches` array.  Defensive fallbacks cover older shapes.
        const inner = result.results?.results ?? result.results ?? {};
        const list: NodeOption[] = (
          inner.matches ||
          (Array.isArray(inner) ? inner : []) ||
          []
        ).slice(0, 25);
        setMatches(list);
      } catch {
        if (!cancelled) setMatches([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [input]);

  const display = value ? value.label : input;

  return (
    <div ref={wrapperRef} className="relative">
      {value ? (
        <div className="flex items-center gap-1.5 h-9 px-2 border border-gray-200 rounded-md bg-gray-50/60">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: colorFor(value.type).fill }}
          />
          <span className="text-xs font-medium text-gray-800 truncate flex-1">
            {value.label}
          </span>
          <span className="text-[10px] text-gray-400 capitalize">
            {value.type}
          </span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setInput("");
              setOpen(true);
            }}
            disabled={disabled}
            className="text-gray-300 hover:text-gray-600"
            title="Clear"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ) : (
        <Input
          value={display}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="text-sm h-9 border-gray-200 bg-gray-50/50"
        />
      )}

      {!value && open && (input.trim().length > 0 || loading) && (
        <div className="absolute z-30 mt-1 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-auto">
          {loading && (
            <div className="px-3 py-2 text-[11px] text-gray-400 flex items-center gap-2">
              <RefreshCw size={11} className="animate-spin" /> Searching…
            </div>
          )}
          {!loading && matches.length === 0 && (
            <div className="px-3 py-2 text-[11px] text-gray-400">
              No matches.
            </div>
          )}
          {matches.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChange(m);
                setInput("");
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-fuchsia-50/60 transition-colors"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: colorFor(m.type).fill }}
              />
              <span className="font-medium text-gray-800 truncate flex-1">
                {m.label}
              </span>
              <span className="text-[10px] text-gray-400 capitalize">
                {m.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────

interface GraphCanvasProps {
  visualization: KGVisualization | null;
  loading: boolean;
}

type PositionedNode = KGVisualizationNode & { _px: number; _py: number };

const GraphCanvas: React.FC<GraphCanvasProps> = ({ visualization, loading }) => {
  const [hoveredNode, setHoveredNode] = useState<KGVisualizationNode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState({ width: 800, height: 480 });

  // Pan / zoom state.  `scale` is the multiplier (1 = fit-to-canvas);
  // `translate` is the offset in *screen* pixels.  We compose them as
  // a single SVG <g> transform around the world content.
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const panState = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  // Reset view whenever a fresh visualization arrives so a stale
  // pan from the previous graph doesn't fly the new one offscreen.
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setHoveredNode(null);
  }, [visualization]);

  useEffect(() => {
    const onResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSize({
        width: Math.max(320, rect.width),
        height: Math.max(360, rect.height),
      });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const zoomAtPoint = (factor: number, anchorX: number, anchorY: number) => {
    setScale((prev) => {
      const next = Math.max(0.3, Math.min(4, prev * factor));
      if (next === prev) return prev;
      // Keep the anchor point stationary in screen space.
      const ratio = next / prev;
      setTranslate((t) => ({
        x: anchorX - (anchorX - t.x) * ratio,
        y: anchorY - (anchorY - t.y) * ratio,
      }));
      return next;
    });
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    // Block parent scroll so zoom feels native.
    e.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    zoomAtPoint(factor, e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    panState.current = {
      x: e.clientX,
      y: e.clientY,
      tx: translate.x,
      ty: translate.y,
    };
  };
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!panState.current) return;
    setTranslate({
      x: panState.current.tx + (e.clientX - panState.current.x),
      y: panState.current.ty + (e.clientY - panState.current.y),
    });
  };
  const handleMouseUp = () => {
    panState.current = null;
  };

  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const layout = useMemo<{
    nodes: PositionedNode[];
    edges: KGVisualizationEdge[];
    byId: Map<string, PositionedNode>;
  }>(() => {
    const nodes = visualization?.visualization.nodes || [];
    const edges = visualization?.visualization.edges || [];

    if (nodes.length === 0) {
      return { nodes: [], edges: [], byId: new Map<string, PositionedNode>() };
    }

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    nodes.forEach((n: KGVisualizationNode) => {
      const x = typeof n.x === "number" ? n.x : 0;
      const y = typeof n.y === "number" ? n.y : 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });

    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const pad = 40;

    const projected: PositionedNode[] = nodes.map((n: KGVisualizationNode) => {
      const rawX = typeof n.x === "number" ? n.x : 0;
      const rawY = typeof n.y === "number" ? n.y : 0;
      const nx = (rawX - minX) / spanX;
      const ny = (rawY - minY) / spanY;
      return {
        ...n,
        _px: pad + nx * (size.width - pad * 2),
        _py: pad + ny * (size.height - pad * 2),
      };
    });

    const byId = new Map<string, PositionedNode>(
      projected.map((n) => [n.id, n] as const),
    );
    return { nodes: projected, edges, byId };
  }, [visualization, size]);

  if (loading) {
    return (
      <div
        ref={containerRef}
        className="bg-gradient-to-br from-gray-50 to-white min-h-[480px] flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-xs">Computing layout…</span>
        </div>
      </div>
    );
  }

  if (!visualization || layout.nodes.length === 0) {
    return (
      <div
        ref={containerRef}
        className="bg-gradient-to-br from-gray-50 to-white min-h-[480px] flex items-center justify-center px-6"
      >
        <div className="text-center max-w-sm">
          <Network size={28} className="mx-auto text-gray-300 mb-3" />
          <h4 className="text-sm font-semibold text-gray-700 mb-1">
            Your graph is empty
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Extract knowledge from a document or paste text to begin building
            connections.
          </p>
        </div>
      </div>
    );
  }

  const isPanning = panState.current !== null;
  const transform = `translate(${translate.x} ${translate.y}) scale(${scale})`;

  return (
    <div
      ref={containerRef}
      className="relative bg-gradient-to-br from-gray-50 to-white min-h-[480px] overflow-hidden select-none"
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.width} ${size.height}`}
        xmlns="http://www.w3.org/2000/svg"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        <defs>
          {/* Subtle dot grid in the background for depth */}
          <pattern
            id="kg-dotgrid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="rgba(148, 163, 184, 0.18)" />
          </pattern>
          <marker
            id="kg-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(100, 116, 139, 0.55)" />
          </marker>
        </defs>
        {/* Background grid stays anchored to the viewport, not the
            world group — so panning doesn't drag the dots with it. */}
        <rect
          x={0}
          y={0}
          width={size.width}
          height={size.height}
          fill="url(#kg-dotgrid)"
        />

        <g transform={transform}>
          {/* Edges */}
          {layout.edges.map((e, idx) => {
            const a = layout.byId.get(e.source);
            const b = layout.byId.get(e.target);
            if (!a || !b) return null;
            const isAdjacentToHover =
              hoveredNode &&
              (hoveredNode.id === a.id || hoveredNode.id === b.id);
            return (
              <g key={`e-${idx}`}>
                <line
                  x1={a._px}
                  y1={a._py}
                  x2={b._px}
                  y2={b._py}
                  stroke={
                    isAdjacentToHover
                      ? "rgba(168, 85, 247, 0.85)"
                      : "rgba(100, 116, 139, 0.55)"
                  }
                  strokeWidth={isAdjacentToHover ? 1.75 / scale : 1.25 / scale}
                  markerEnd="url(#kg-arrow)"
                />
                {isAdjacentToHover && (
                  <text
                    x={(a._px + b._px) / 2}
                    y={(a._py + b._py) / 2 - 4}
                    textAnchor="middle"
                    fontSize={10 / scale}
                    fill="rgb(126, 34, 206)"
                    className="pointer-events-none"
                  >
                    {e.type?.replace(/_/g, " ")}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {layout.nodes.map((n) => {
            const c = colorFor(n.type);
            const isHovered = hoveredNode?.id === n.id;
            const r = isHovered ? 13 : 10;
            return (
              <g
                key={n.id}
                onMouseEnter={() => setHoveredNode(n)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={n._px}
                  cy={n._py}
                  r={r + 3}
                  fill={c.fill}
                  opacity={isHovered ? 0.18 : 0.1}
                />
                <circle
                  cx={n._px}
                  cy={n._py}
                  r={r}
                  fill={c.fill}
                  stroke="white"
                  strokeWidth={2 / scale}
                />
                {/* Always-on label beside each node for readability */}
                <text
                  x={n._px + r + 4}
                  y={n._py + 3}
                  fontSize={(isHovered ? 12 : 11) / scale}
                  fontWeight={isHovered ? 600 : 500}
                  fill={isHovered ? "rgb(17, 24, 39)" : "rgb(55, 65, 81)"}
                  className="pointer-events-none"
                >
                  {(n.label || n.id).slice(0, 28)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-white/95 border border-gray-200 shadow-sm rounded-lg p-1">
        <button
          onClick={() => zoomAtPoint(1.25, size.width / 2, size.height / 2)}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={() => zoomAtPoint(0.8, size.width / 2, size.height / 2)}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={resetView}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
          title="Reset view"
          aria-label="Reset view"
        >
          <Maximize2 size={12} />
        </button>
      </div>

      <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 bg-white/80 border border-gray-200 rounded px-2 py-1">
        {Math.round(scale * 100)}% · scroll to zoom · drag to pan
      </div>

      {hoveredNode && (
        <div className="absolute bottom-3 left-3 bg-white/95 border border-gray-200 shadow-md rounded-lg px-3 py-2 text-[11px] text-gray-700 max-w-[280px]">
          <div className="font-semibold truncate">{hoveredNode.label}</div>
          <div className="text-gray-500 capitalize">{hoveredNode.type}</div>
        </div>
      )}
    </div>
  );
};

// ─── Main page ───────────────────────────────────────────────────────

const KnowledgeGraphAgent: React.FC = () => {
  // ── Data
  const [stats, setStats] = useState<KGStats | null>(null);
  const [nodeTypes, setNodeTypes] = useState<string[]>([]);
  const [visualization, setVisualization] = useState<KGVisualization | null>(null);
  const [extractions, setExtractions] = useState<KGExtraction[]>([]);

  // ── UI state
  const [statsLoading, setStatsLoading] = useState(true);
  const [vizLoading, setVizLoading] = useState(true);
  const [extractionsLoading, setExtractionsLoading] = useState(true);

  // Visualization scope.  `focus` = null → show the whole org graph.
  // Non-null → show only those node ids plus their 2-hop neighborhood.
  // `focusLabel` describes the scope in the UI badge (e.g. "Latest
  // extraction · 12 nodes").  Switching extractions, refreshing, or
  // clicking "Show all" clears or replaces this.
  const [focus, setFocus] = useState<string[] | null>(null);
  const [focusLabel, setFocusLabel] = useState<string | null>(null);

  const [activeDialog, setActiveDialog] = useState<
    "extract" | "discover" | "fill_gaps" | null
  >(null);

  // Extract dialog state
  const [extractContent, setExtractContent] = useState("");
  const [extractTitle, setExtractTitle] = useState("");
  const [extractRagDocId, setExtractRagDocId] = useState("");
  const [extractSubmitting, setExtractSubmitting] = useState(false);

  // Discover / fill gaps dialog state
  const [focusInput, setFocusInput] = useState("");
  const [focusSubmitting, setFocusSubmitting] = useState(false);

  // Query state
  const [queryType, setQueryType] = useState<"search" | "neighbors" | "path">(
    "search",
  );
  // For "search" mode we keep a free-text term (the LLM's matching is
  // substring-based, so users can search ideas, not just exact labels).
  // For "neighbors" and "path" the user picks actual nodes from the
  // autocomplete, so we hold the resolved (id, label, type) objects.
  const [searchTerm, setSearchTerm] = useState("");
  const [pickedSource, setPickedSource] = useState<NodeOption | null>(null);
  const [pickedTarget, setPickedTarget] = useState<NodeOption | null>(null);
  const [queryRunning, setQueryRunning] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  // ── Loaders
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await knowledgeGraphApi.getStats();
      setStats(data);
    } catch (err) {
      toast({
        title: "Could not load stats",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadNodeTypes = useCallback(async () => {
    try {
      const list = await knowledgeGraphApi.getNodeTypes();
      setNodeTypes(list);
    } catch {
      // Non-fatal; we fall back to the keys in stats.node_types.
    }
  }, []);

  const loadVisualization = useCallback(
    async (focusIds?: string[] | null) => {
      try {
        setVizLoading(true);
        const payload =
          focusIds && focusIds.length > 0 ? { focus: focusIds } : {};
        const data = await knowledgeGraphApi.visualize(payload);
        setVisualization(data);
      } catch (err) {
        toast({
          title: "Could not render graph",
          description: extractErrorMessage(err),
          variant: "destructive",
        });
      } finally {
        setVizLoading(false);
      }
    },
    [],
  );

  const showAll = useCallback(() => {
    setFocus(null);
    setFocusLabel(null);
    loadVisualization(null);
  }, [loadVisualization]);

  const focusOnIds = useCallback(
    (ids: string[], label: string) => {
      if (!ids || ids.length === 0) {
        showAll();
        return;
      }
      setFocus(ids);
      setFocusLabel(label);
      loadVisualization(ids);
    },
    [loadVisualization, showAll],
  );

  const loadExtractions = useCallback(async () => {
    try {
      setExtractionsLoading(true);
      const data = await knowledgeGraphApi.listExtractions({ limit: 10 });
      setExtractions(data.extractions || []);
    } catch (err) {
      toast({
        title: "Could not load extractions",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setExtractionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadNodeTypes();
    loadVisualization();
    loadExtractions();
  }, [loadStats, loadNodeTypes, loadVisualization, loadExtractions]);

  // ── Action handlers
  const handleActionClick = (key: (typeof ACTIONS)[number]["key"]) => {
    if (key === "visualize") {
      // Refresh respects the current focus mode.
      loadVisualization(focus);
      loadStats();
      return;
    }
    setActiveDialog(key);
  };

  const handleExtract = async () => {
    const content = extractContent.trim();
    const ragId = extractRagDocId.trim();
    if (!content && !ragId) {
      toast({
        title: "Nothing to extract",
        description: "Paste some content or supply a document id.",
        variant: "destructive",
      });
      return;
    }
    try {
      setExtractSubmitting(true);
      const result = await knowledgeGraphApi.extract({
        content: content || undefined,
        rag_document_id: ragId || undefined,
        metadata: extractTitle ? { title: extractTitle.trim() } : undefined,
      });
      const added =
        (result.metadata?.added_node_count ?? 0) +
        (result.metadata?.added_edge_count ?? 0);
      toast({
        title: "Extraction complete",
        description:
          added > 0
            ? `Added ${result.metadata?.added_node_count ?? 0} nodes and ${
                result.metadata?.added_edge_count ?? 0
              } relations.`
            : "No new entities were found in this content.",
      });
      setActiveDialog(null);
      setExtractContent("");
      setExtractTitle("");
      setExtractRagDocId("");
      // Scope the viz to the freshly extracted nodes so the user
      // sees what they just did, not the accumulated full graph.
      const newIds = result.metadata?.added_node_ids || [];
      if (newIds.length > 0) {
        setFocus(newIds);
        setFocusLabel(
          extractTitle.trim()
            ? `Latest: ${extractTitle.trim()}`
            : `Latest extraction · ${newIds.length} nodes`,
        );
        await Promise.all([
          loadStats(),
          loadVisualization(newIds),
          loadExtractions(),
        ]);
      } else {
        await Promise.all([
          loadStats(),
          loadVisualization(focus),
          loadExtractions(),
        ]);
      }
    } catch (err) {
      toast({
        title: "Extraction failed",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setExtractSubmitting(false);
    }
  };

  const handleFocusSubmit = async () => {
    const focusTerms = parseFocusInput(focusInput);
    if (focusTerms.length === 0) {
      toast({
        title: "Add at least one focus area",
        description: "Separate multiple values with commas or new lines.",
        variant: "destructive",
      });
      return;
    }
    try {
      setFocusSubmitting(true);
      const call =
        activeDialog === "discover"
          ? knowledgeGraphApi.discoverRelations({ focus: focusTerms })
          : knowledgeGraphApi.fillGaps({ focus: focusTerms });
      const result = await call;
      toast({
        title: activeDialog === "discover" ? "Relations discovered" : "Gaps filled",
        description: `Added ${result.metadata?.added_node_count ?? 0} nodes and ${
          result.metadata?.added_edge_count ?? 0
        } relations.`,
      });
      setActiveDialog(null);
      setFocusInput("");
      const newIds = result.metadata?.added_node_ids || [];
      const dialogLabel =
        activeDialog === "discover" ? "Latest discovery" : "Latest gap-fill";
      if (newIds.length > 0) {
        setFocus(newIds);
        setFocusLabel(`${dialogLabel} · ${newIds.length} nodes`);
        await Promise.all([
          loadStats(),
          loadVisualization(newIds),
          loadExtractions(),
        ]);
      } else {
        await Promise.all([
          loadStats(),
          loadVisualization(focus),
          loadExtractions(),
        ]);
      }
    } catch (err) {
      toast({
        title: activeDialog === "discover" ? "Discovery failed" : "Gap-fill failed",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setFocusSubmitting(false);
    }
  };

  const handleQuery = async () => {
    let payload: Record<string, any> = {};
    if (queryType === "search") {
      const term = searchTerm.trim();
      if (!term) return;
      payload = { term };
    } else if (queryType === "neighbors") {
      if (!pickedSource) {
        toast({
          title: "Pick a node",
          description: "Type to search and select the node to expand.",
          variant: "destructive",
        });
        return;
      }
      payload = { node_id: pickedSource.id };
    } else if (queryType === "path") {
      if (!pickedSource || !pickedTarget) {
        toast({
          title: "Pick both endpoints",
          description: "Path queries need a source and a target node.",
          variant: "destructive",
        });
        return;
      }
      payload = { source: pickedSource.id, target: pickedTarget.id };
    }

    try {
      setQueryRunning(true);
      const result = await knowledgeGraphApi.query({
        query_type: queryType,
        query: payload,
      });
      // The agent wraps query output as { query_type, results: <inner>,
      // metadata }, then the orchestrator wraps that again as { results,
      // metadata }.  Peel both layers so the view component sees the
      // raw inner shape ({matches}, {neighbors}, {paths}).
      setQueryResult(result.results?.results ?? result.results ?? null);
    } catch (err) {
      toast({
        title: "Query failed",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setQueryRunning(false);
    }
  };

  // Convenience: from a Search result row, jump straight into a
  // Neighbors query on that node — the productivity short-circuit
  // the user asked for.
  const expandFromSearch = (node: NodeOption) => {
    setQueryType("neighbors");
    setPickedSource(node);
    setPickedTarget(null);
    setQueryResult(null);
    // Fire the query immediately; we can't use `handleQuery` here
    // because state hasn't flushed yet.
    (async () => {
      try {
        setQueryRunning(true);
        const result = await knowledgeGraphApi.query({
          query_type: "neighbors",
          query: { node_id: node.id },
        });
        setQueryResult(result.results?.results ?? result.results ?? null);
      } catch (err) {
        toast({
          title: "Query failed",
          description: extractErrorMessage(err),
          variant: "destructive",
        });
      } finally {
        setQueryRunning(false);
      }
    })();
  };

  const useAsSource = (node: NodeOption) => {
    setQueryType("path");
    setPickedSource(node);
    setPickedTarget(null);
    setQueryResult(null);
  };

  const useAsTarget = (node: NodeOption) => {
    setQueryType("path");
    setPickedTarget(node);
    setQueryResult(null);
  };

  const handleDeleteExtraction = async (id: string) => {
    try {
      await knowledgeGraphApi.deleteExtraction(id);
      toast({ title: "Extraction removed" });
      const removed = extractions.find((x) => x.id === id);
      setExtractions((prev) => prev.filter((x) => x.id !== id));

      // If the current focus was on this extraction (or any of its
      // node ids are gone now), reset to the full graph so the user
      // doesn't stare at a deleted scope.
      if (
        removed?.node_ids &&
        focus &&
        removed.node_ids.some((nid) => focus.includes(nid))
      ) {
        setFocus(null);
        setFocusLabel(null);
      }
      await Promise.all([loadStats(), loadVisualization(null)]);
    } catch (err) {
      toast({
        title: "Delete failed",
        description: extractErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  // ── Derived
  const totalNodes = stats?.node_count ?? 0;
  const totalEdges = stats?.edge_count ?? 0;
  const distinctTypes = Object.keys(stats?.node_types || {}).length;
  const lastUpdated = stats?.last_updated_at
    ? relativeTime(stats.last_updated_at)
    : "—";

  const typeRows = useMemo(() => {
    const counts = stats?.node_types || {};
    const keys = new Set<string>([
      ...nodeTypes,
      ...Object.keys(counts),
    ]);
    return Array.from(keys)
      .map((t) => ({ type: t, count: counts[t] || 0, color: colorFor(t) }))
      .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
  }, [stats, nodeTypes]);

  // ── Render
  return (
    <AgentPageLayout
      agentName="Knowledge Graph"
      tagline="Connect the dots"
      icon={Brain}
      gradient="from-fuchsia-500 to-purple-600"
      status="beta"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Nodes",
            value: totalNodes.toLocaleString(),
            icon: Circle,
            color: "text-fuchsia-500",
          },
          {
            label: "Relations",
            value: totalEdges.toLocaleString(),
            icon: GitBranch,
            color: "text-blue-500",
          },
          {
            label: "Node Types",
            value: distinctTypes.toString(),
            icon: Layers,
            color: "text-emerald-500",
          },
          {
            label: "Last Updated",
            value: lastUpdated,
            icon: Clock,
            color: "text-amber-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} className={s.color} />
              <span className="text-xs text-gray-400">{s.label}</span>
            </div>
            {statsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {ACTIONS.map((a) => (
          <button
            key={a.key}
            onClick={() => handleActionClick(a.key)}
            className="group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left"
          >
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center text-white mb-2`}
            >
              <a.icon size={14} />
            </div>
            <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
              {a.label}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">
              {a.description}
            </p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Graph + Query */}
        <div className="lg:col-span-3 space-y-6">
          {/* Graph Visualization */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-gray-900">
                  Graph Visualization
                </h3>
                {focus && (
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px] gap-1 border-fuchsia-200 text-fuchsia-600 bg-fuchsia-50"
                  >
                    <Sparkles size={9} />
                    {focusLabel || `Focused · ${focus.length} nodes`}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {focus && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={showAll}
                    className="text-xs text-gray-500 h-7 gap-1"
                  >
                    Show all
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadVisualization(focus)}
                  disabled={vizLoading}
                  className="text-xs text-gray-500 h-7 gap-1"
                >
                  <RefreshCw
                    size={12}
                    className={vizLoading ? "animate-spin" : ""}
                  />
                  Refresh
                </Button>
              </div>
            </div>
            <GraphCanvas visualization={visualization} loading={vizLoading} />
          </div>

          {/* Query */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Query Graph
              </h3>
              <div className="inline-flex rounded-md border border-gray-200 bg-gray-50/60 p-0.5 text-[11px]">
                {(["search", "neighbors", "path"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setQueryType(mode);
                      setQueryResult(null);
                    }}
                    className={`px-2.5 py-1 rounded transition-colors capitalize ${
                      queryType === mode
                        ? "bg-white shadow-sm text-gray-900 font-medium"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {queryType === "search" && (
                <div className="flex gap-2">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !queryRunning) handleQuery();
                    }}
                    placeholder="Search by label or text…"
                    className="text-sm h-9 border-gray-200 bg-gray-50/50"
                  />
                  <Button
                    onClick={handleQuery}
                    disabled={queryRunning || !searchTerm.trim()}
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-3 shrink-0"
                  >
                    {queryRunning ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </Button>
                </div>
              )}

              {queryType === "neighbors" && (
                <div className="flex gap-2 items-start">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-wide text-gray-400 mb-1 block">
                      Node
                    </label>
                    <NodePicker
                      value={pickedSource}
                      onChange={setPickedSource}
                      placeholder="Type to find a node…"
                    />
                  </div>
                  <Button
                    onClick={handleQuery}
                    disabled={queryRunning || !pickedSource}
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-3 mt-[18px] shrink-0"
                  >
                    {queryRunning ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </Button>
                </div>
              )}

              {queryType === "path" && (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-2 items-start">
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-gray-400 mb-1 block">
                      From
                    </label>
                    <NodePicker
                      value={pickedSource}
                      onChange={setPickedSource}
                      placeholder="Source node…"
                    />
                  </div>
                  <div className="hidden md:flex items-center text-gray-300 mt-[18px]">
                    <ChevronRight size={14} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wide text-gray-400 mb-1 block">
                      To
                    </label>
                    <NodePicker
                      value={pickedTarget}
                      onChange={setPickedTarget}
                      placeholder="Target node…"
                    />
                  </div>
                  <Button
                    onClick={handleQuery}
                    disabled={queryRunning || !pickedSource || !pickedTarget}
                    size="sm"
                    className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-3 mt-[18px] shrink-0"
                  >
                    {queryRunning ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </Button>
                </div>
              )}

              <p className="text-[10px] text-gray-400 pt-1">
                {queryType === "search"
                  ? "Find matching nodes. Click a result to expand its connections."
                  : queryType === "neighbors"
                  ? "See everything directly connected to this node."
                  : "Show the shortest chain of connections between two nodes."}
              </p>
            </div>

            {/* Query results */}
            {queryResult && (
              <div className="mt-4 border-t border-gray-50 pt-3">
                <QueryResultsView
                  result={queryResult}
                  type={queryType}
                  onExpand={expandFromSearch}
                  onUseAsSource={useAsSource}
                  onUseAsTarget={useAsTarget}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Legend + Recent */}
        <div className="lg:col-span-2 space-y-6">
          {/* Node Types Legend */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Node Types
            </h3>
            {statsLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : typeRows.length === 0 ? (
              <p className="text-xs text-gray-400">
                No nodes yet — your legend will populate as your graph grows.
              </p>
            ) : (
              <div className="space-y-2">
                {typeRows.map((t) => (
                  <div
                    key={t.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${t.color.bg}`}
                      />
                      <span className="text-xs text-gray-600 capitalize">
                        {t.type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{t.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Extractions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Recent Extractions
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadExtractions}
                disabled={extractionsLoading}
                className="text-xs text-gray-400 h-7 px-2"
              >
                <RefreshCw
                  size={11}
                  className={extractionsLoading ? "animate-spin" : ""}
                />
              </Button>
            </div>
            {extractionsLoading ? (
              <div className="p-4 space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : extractions.length === 0 ? (
              <div className="p-6 text-center">
                <Sparkles
                  size={20}
                  className="mx-auto text-gray-300 mb-2"
                />
                <p className="text-xs text-gray-500">
                  No extractions yet. Hit{" "}
                  <span className="font-medium text-gray-700">
                    Extract Knowledge
                  </span>{" "}
                  to begin.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {extractions.map((e) => {
                  const isActive =
                    !!focus &&
                    e.node_ids &&
                    e.node_ids.length > 0 &&
                    e.node_ids.every((id) => focus.includes(id));
                  return (
                    <div
                      key={e.id}
                      className={`p-3 flex items-center gap-3 transition-colors ${
                        isActive ? "bg-fuchsia-50/60" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <Brain
                        size={14}
                        className={
                          isActive
                            ? "text-fuchsia-600 shrink-0"
                            : "text-fuchsia-400 shrink-0"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (isActive) {
                            showAll();
                            return;
                          }
                          if (!e.node_ids || e.node_ids.length === 0) {
                            toast({
                              title: "Nothing to focus on",
                              description:
                                "This extraction didn't add any nodes.",
                            });
                            return;
                          }
                          focusOnIds(
                            e.node_ids,
                            e.title || `Extraction · ${e.node_ids.length} nodes`,
                          );
                        }}
                        className="flex-1 min-w-0 text-left"
                        title={
                          isActive
                            ? "Click to show full graph"
                            : "Click to focus the graph on this extraction"
                        }
                      >
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {e.title || e.content_preview || `Untitled ${e.action}`}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {relativeTime(e.created_at)} ·{" "}
                          {e.node_count.toLocaleString()} nodes ·{" "}
                          {e.edge_count.toLocaleString()} relations
                          {e.status === "error" && (
                            <Badge
                              variant="outline"
                              className="ml-2 h-4 text-[9px] border-red-200 text-red-500"
                            >
                              error
                            </Badge>
                          )}
                        </p>
                      </button>
                      <button
                        onClick={() => handleDeleteExtraction(e.id)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Dialogs ── */}

      <Dialog
        open={activeDialog === "extract"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Extract Knowledge</DialogTitle>
            <DialogDescription>
              Paste content or supply a document id from your library.
              Lumicoria will pull out entities and their relationships.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">
                Title (optional)
              </label>
              <Input
                value={extractTitle}
                onChange={(e) => setExtractTitle(e.target.value)}
                placeholder="e.g. Q1 product strategy"
                className="mt-1 h-9 text-sm"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Content
              </label>
              <Textarea
                value={extractContent}
                onChange={(e) => setExtractContent(e.target.value)}
                placeholder="Paste a document, meeting notes, or any text..."
                className="mt-1 min-h-[160px] text-sm"
                maxLength={50000}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                {extractContent.length.toLocaleString()} / 50,000 characters
              </p>
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <span className="h-px flex-1 bg-gray-100" />
              or
              <span className="h-px flex-1 bg-gray-100" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">
                Library document id
              </label>
              <Input
                value={extractRagDocId}
                onChange={(e) => setExtractRagDocId(e.target.value)}
                placeholder="document-id-from-your-library"
                className="mt-1 h-9 text-sm font-mono"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Reuse an already-uploaded document instead of pasting its
                contents.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setActiveDialog(null)}
              disabled={extractSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExtract}
              disabled={
                extractSubmitting ||
                (!extractContent.trim() && !extractRagDocId.trim())
              }
              className="bg-fuchsia-600 hover:bg-fuchsia-700"
            >
              {extractSubmitting ? (
                <>
                  <RefreshCw size={14} className="mr-2 animate-spin" /> Extracting…
                </>
              ) : (
                "Extract"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeDialog === "discover" || activeDialog === "fill_gaps"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeDialog === "discover"
                ? "Discover Relations"
                : "Fill Knowledge Gaps"}
            </DialogTitle>
            <DialogDescription>
              {activeDialog === "discover"
                ? "List the topics or entities to study. Lumicoria will propose new connections."
                : "List the areas to investigate. Lumicoria will surface missing concepts and connections."}
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-xs font-medium text-gray-600">
              Focus areas
            </label>
            <Textarea
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              placeholder="Comma- or newline-separated. e.g. authentication, billing pipeline, churn"
              className="mt-1 min-h-[120px] text-sm"
              maxLength={4000}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Up to 20 focus areas, 200 characters each.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setActiveDialog(null)}
              disabled={focusSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFocusSubmit}
              disabled={focusSubmitting || !focusInput.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {focusSubmitting ? (
                <>
                  <RefreshCw size={14} className="mr-2 animate-spin" /> Working…
                </>
              ) : activeDialog === "discover" ? (
                "Discover"
              ) : (
                "Fill gaps"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AgentPageLayout>
  );
};

// ─── Query results sub-view ─────────────────────────────────────────

interface QueryResultsViewProps {
  result: any;
  type: "search" | "neighbors" | "path";
  onExpand: (node: NodeOption) => void;
  onUseAsSource: (node: NodeOption) => void;
  onUseAsTarget: (node: NodeOption) => void;
}

const QueryResultsView: React.FC<QueryResultsViewProps> = ({
  result,
  type,
  onExpand,
  onUseAsSource,
  onUseAsTarget,
}) => {
  if (!result) return null;

  if (type === "search") {
    const matches: NodeOption[] = result.matches || result.results || [];
    if (matches.length === 0) {
      return (
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <AlertCircle size={12} /> No matches.
        </p>
      );
    }
    return (
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
          {matches.length} match{matches.length === 1 ? "" : "es"} · click to
          expand, or use as path endpoint
        </p>
        {matches.slice(0, 25).map((m) => (
          <div
            key={m.id}
            className="group flex items-center gap-2 text-xs text-gray-700 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
          >
            <button
              type="button"
              onClick={() => onExpand(m)}
              className="flex items-center gap-2 flex-1 min-w-0 text-left"
              title="Show neighbors of this node"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: colorFor(m.type).fill }}
              />
              <span className="font-medium truncate">{m.label}</span>
              <span className="text-gray-400 capitalize">· {m.type}</span>
            </button>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                type="button"
                onClick={() => onUseAsSource(m)}
                className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-100"
                title="Use as path source"
              >
                from
              </button>
              <button
                type="button"
                onClick={() => onUseAsTarget(m)}
                className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-100"
                title="Use as path target"
              >
                to
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "neighbors") {
    const neighbors: Array<NodeOption & { edge_type?: string }> =
      result.neighbors || [];
    if (neighbors.length === 0) {
      return (
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <AlertCircle size={12} /> No neighbors.
        </p>
      );
    }
    return (
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
          {neighbors.length} neighbor{neighbors.length === 1 ? "" : "s"} ·
          click any to dive deeper
        </p>
        {neighbors.slice(0, 25).map((n, idx) => (
          <button
            type="button"
            key={`${n.id}-${idx}`}
            onClick={() => onExpand(n)}
            className="w-full flex items-center gap-2 text-xs text-gray-700 px-2 py-1 rounded hover:bg-gray-50 transition-colors text-left"
            title="Show this node's neighbors"
          >
            <ChevronRight size={12} className="text-gray-300 shrink-0" />
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: colorFor(n.type).fill }}
            />
            <span className="font-medium truncate">{n.label}</span>
            <span className="text-gray-400 capitalize">· {n.type}</span>
            {n.edge_type && (
              <Badge variant="outline" className="ml-auto h-4 text-[9px]">
                {n.edge_type.replace(/_/g, " ")}
              </Badge>
            )}
          </button>
        ))}
      </div>
    );
  }

  // path
  const paths: Array<Array<NodeOption>> =
    result.paths || (result.path ? [result.path] : []);
  if (paths.length === 0) {
    return (
      <p className="text-xs text-gray-400 flex items-center gap-2">
        <AlertCircle size={12} /> No path between those nodes.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-wide text-gray-400">
        {paths.length} path{paths.length === 1 ? "" : "s"} found
      </p>
      {paths.slice(0, 5).map((p, idx) => (
        <div key={idx} className="flex items-center gap-1 flex-wrap">
          {p.map((node, i) => (
            <React.Fragment key={`${node.id}-${i}`}>
              <button
                type="button"
                onClick={() => onExpand(node)}
                className="px-2 py-0.5 rounded-md text-[11px] text-white hover:opacity-85"
                style={{ background: colorFor(node.type).fill }}
                title="Show this node's neighbors"
              >
                {node.label}
              </button>
              {i < p.length - 1 && (
                <ChevronRight size={12} className="text-gray-300" />
              )}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

export default KnowledgeGraphAgent;
