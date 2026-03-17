import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart3, Upload, TrendingUp, AlertTriangle, Sigma,
  PieChart, LineChart, ScatterChart, Grid3x3, Send, Table,
} from "lucide-react";
import AgentPageLayout from "@/components/AgentPageLayout";

const analysisTypes = [
  { id: "stats", label: "Statistical", icon: Sigma, color: "from-blue-500 to-indigo-600" },
  { id: "anomaly", label: "Anomaly Detection", icon: AlertTriangle, color: "from-red-500 to-rose-600" },
  { id: "trend", label: "Trend Analysis", icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
  { id: "correlation", label: "Correlation", icon: ScatterChart, color: "from-violet-500 to-purple-600" },
  { id: "summary", label: "Summary Stats", icon: Table, color: "from-amber-500 to-orange-600" },
];

const chartTypes = [
  { id: "bar", label: "Bar", icon: BarChart3 },
  { id: "line", label: "Line", icon: LineChart },
  { id: "scatter", label: "Scatter", icon: ScatterChart },
  { id: "pie", label: "Pie", icon: PieChart },
  { id: "heatmap", label: "Heatmap", icon: Grid3x3 },
];

const mockMetrics = [
  { label: "Mean", value: "42.8" },
  { label: "Median", value: "38.5" },
  { label: "Std Dev", value: "12.3" },
  { label: "Min", value: "8.0" },
  { label: "Max", value: "96.2" },
  { label: "Count", value: "1,248" },
];

const mockTable = [
  { id: 1, name: "Product A", sales: 1250, revenue: "$45,000", growth: "+12%" },
  { id: 2, name: "Product B", sales: 890, revenue: "$32,100", growth: "+8%" },
  { id: 3, name: "Product C", sales: 2100, revenue: "$78,400", growth: "+24%" },
  { id: 4, name: "Product D", sales: 450, revenue: "$16,200", growth: "-3%" },
  { id: 5, name: "Product E", sales: 1680, revenue: "$60,500", growth: "+15%" },
];

const DataAnalysisAgent: React.FC = () => {
  const [activeType, setActiveType] = useState("stats");
  const [activeChart, setActiveChart] = useState("bar");
  const [nlQuery, setNlQuery] = useState("");

  return (
    <AgentPageLayout agentName="Data Analysis Agent" tagline="Insights from your data" icon={BarChart3} gradient="from-blue-500 to-violet-600">
      {/* Upload */}
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center mb-6 hover:border-gray-300 transition-colors">
        <Upload size={20} className="text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600 mb-1">Drop your data file here</p>
        <p className="text-xs text-gray-400 mb-3">CSV, Excel, JSON — up to 100MB</p>
        <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-xs">Browse Files</Button>
      </div>

      {/* Analysis Type */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {analysisTypes.map((t) => (
          <button key={t.id} onClick={() => setActiveType(t.id)} className={`group bg-white border rounded-xl p-3 transition-all text-left ${activeType === t.id ? "border-gray-900 shadow-md" : "border-gray-100 shadow-sm hover:border-gray-200"}`}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-white mb-2`}><t.icon size={14} /></div>
            <p className="text-xs font-medium text-gray-700">{t.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left */}
        <div className="lg:col-span-3 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {mockMetrics.map((m) => (
              <div key={m.label} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-center">
                <p className="text-lg font-bold text-gray-900">{m.value}</p>
                <p className="text-[10px] text-gray-400">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Visualization</h3>
              <div className="flex gap-1">
                {chartTypes.map((c) => (
                  <button key={c.id} onClick={() => setActiveChart(c.id)} className={`p-1.5 rounded-md transition-colors ${activeChart === c.id ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-100"}`}>
                    <c.icon size={14} />
                  </button>
                ))}
              </div>
            </div>
            <div className="p-8 flex flex-col items-center justify-center min-h-[240px] bg-gray-50/50">
              <BarChart3 size={40} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 mb-1">Visualization will appear here</p>
              <p className="text-xs text-gray-300">Upload data to generate charts</p>
            </div>
          </div>

          {/* NL Query */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ask About Your Data</h3>
            <div className="flex gap-2">
              <Input value={nlQuery} onChange={(e) => setNlQuery(e.target.value)} placeholder="e.g., What's the top selling product?" className="text-sm h-9 border-gray-200 bg-gray-50/50" />
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-3 shrink-0"><Send size={14} /></Button>
            </div>
            <div className="flex gap-2 mt-2">
              {["Show trends over time", "Find outliers", "Compare categories"].map((q) => (
                <button key={q} className="px-2 py-1 rounded-md bg-gray-50 text-[10px] text-gray-500 hover:bg-gray-100 transition-colors">{q}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Data Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50"><h3 className="text-sm font-semibold text-gray-900">Data Preview</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="p-2 text-left text-gray-400 font-medium">Name</th>
                    <th className="p-2 text-right text-gray-400 font-medium">Sales</th>
                    <th className="p-2 text-right text-gray-400 font-medium">Revenue</th>
                    <th className="p-2 text-right text-gray-400 font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTable.map((row) => (
                    <tr key={row.id} className="border-b border-gray-50">
                      <td className="p-2 text-gray-700">{row.name}</td>
                      <td className="p-2 text-right text-gray-600">{row.sales.toLocaleString()}</td>
                      <td className="p-2 text-right text-gray-600">{row.revenue}</td>
                      <td className={`p-2 text-right font-medium ${row.growth.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>{row.growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Auto Insights</h3>
            <div className="space-y-2">
              {[
                { text: "Product C has the highest growth rate at +24%", type: "positive" },
                { text: "Product D shows declining sales (-3%)", type: "negative" },
                { text: "Average revenue per product is $46,440", type: "neutral" },
              ].map((insight, i) => (
                <div key={i} className={`p-2.5 rounded-lg text-xs ${insight.type === "positive" ? "bg-emerald-50 text-emerald-700" : insight.type === "negative" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                  {insight.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AgentPageLayout>
  );
};

export default DataAnalysisAgent;
