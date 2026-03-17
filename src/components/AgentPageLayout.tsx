import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AgentPageLayoutProps {
  agentName: string;
  tagline: string;
  icon: React.ElementType;
  gradient: string;
  status?: "stable" | "beta";
  children: React.ReactNode;
}

const AgentPageLayout: React.FC<AgentPageLayoutProps> = ({
  agentName,
  tagline,
  icon: Icon,
  gradient,
  status = "stable",
  children,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-[#FAFBFC] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-lumicoria-purple/[0.03] blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 pt-8 pb-6 max-w-6xl">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/agents")}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 -ml-2 mb-6 h-8 text-xs"
            >
              <ArrowLeft size={14} className="mr-1.5" />
              All Agents
            </Button>
          </motion.div>

          {/* Agent header */}
          <div className="flex items-start gap-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-gray-200/50 shrink-0`}
            >
              <Icon size={26} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex-1 min-w-0"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {agentName}
                </h1>
                {status === "beta" && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0 border-amber-300 text-amber-600 bg-amber-50 font-medium"
                  >
                    Beta
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-400">{tagline}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Button
                size="sm"
                onClick={() => navigate("/chat")}
                className="bg-gray-900 hover:bg-gray-800 text-white h-9 px-4 text-xs font-medium"
              >
                <MessageSquare size={14} className="mr-1.5" />
                Chat with Agent
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="container mx-auto px-4 pb-16 max-w-6xl"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AgentPageLayout;
