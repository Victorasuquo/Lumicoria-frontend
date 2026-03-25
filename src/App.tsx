import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AgentsUniverse from "./pages/AgentsUniverse";
import LiveStudio from "./pages/LiveStudio";
import AgentBuilder from "./pages/AgentBuilder";
import NewWellbeing from "./pages/NewWellbeing";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "@/pages/Profile";
import Onboarding from "@/pages/Onboarding";
import Settings from "./pages/Settings";
import Documents from "./pages/Documents";
import Chat from "./pages/Chat";
import Billing from "./pages/Billing";
import Models from "./pages/Models";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Projects from "./pages/Projects";
import Notifications from "./pages/Notifications";
import Tasks from "./pages/Tasks";

// Agent pages — lazy loaded
const DocumentAgent = lazy(() => import("./pages/agents/DocumentAgent"));
const MeetingAssistant = lazy(() => import("./pages/agents/MeetingAssistant"));
const MeetingFactChecker = lazy(() => import("./pages/agents/MeetingFactChecker"));
const VisionAgent = lazy(() => import("./pages/agents/VisionAgent"));
const ResearchAgent = lazy(() => import("./pages/agents/ResearchAgent"));
const ResearchMentor = lazy(() => import("./pages/agents/ResearchMentor"));
const StudentAgent = lazy(() => import("./pages/agents/StudentAgent"));
const LearningCoach = lazy(() => import("./pages/agents/LearningCoach"));
const RAGAgent = lazy(() => import("./pages/agents/RAGAgent"));
const DataAnalysisAgent = lazy(() => import("./pages/agents/DataAnalysisAgent"));
const KnowledgeGraphAgent = lazy(() => import("./pages/agents/KnowledgeGraphAgent"));
const LegalDocumentAgent = lazy(() => import("./pages/agents/LegalDocumentAgent"));
const EthicsBiasAgent = lazy(() => import("./pages/agents/EthicsBiasAgent"));
const WellbeingCoach = lazy(() => import("./pages/agents/WellbeingCoach"));
const FocusFlowAgent = lazy(() => import("./pages/agents/FocusFlowAgent"));
const WorkspaceErgonomics = lazy(() => import("./pages/agents/WorkspaceErgonomics"));
const CreativeAgent = lazy(() => import("./pages/agents/CreativeAgent"));
const SocialMediaAgent = lazy(() => import("./pages/agents/SocialMediaAgent"));
const TranslationAgent = lazy(() => import("./pages/agents/TranslationAgent"));
const CustomerServiceAgent = lazy(() => import("./pages/agents/CustomerServiceAgent"));

const AgentPageFallback = () => (
  <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-lumicoria-purple rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading agent...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />
      <main className="flex-1 pt-16">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/agents" element={<AgentsUniverse />} />
          <Route path="/live-studio" element={<LiveStudio />} />
          <Route path="/agent-builder" element={<AgentBuilder />} />
          <Route path="/wellbeing" element={<NewWellbeing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/models" element={<Models />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />

          {/* Agent Pages */}
          <Route path="/agents/document" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><DocumentAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/meeting" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><MeetingAssistant /></Suspense></ProtectedRoute>} />
          <Route path="/agents/meeting-fact-checker" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><MeetingFactChecker /></Suspense></ProtectedRoute>} />
          <Route path="/agents/vision" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><VisionAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/research" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><ResearchAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/research-mentor" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><ResearchMentor /></Suspense></ProtectedRoute>} />
          <Route path="/agents/student" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><StudentAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/learning-coach" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><LearningCoach /></Suspense></ProtectedRoute>} />
          <Route path="/agents/rag" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><RAGAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/data-analysis" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><DataAnalysisAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/knowledge-graph" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><KnowledgeGraphAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/legal-document" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><LegalDocumentAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/ethics-bias" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><EthicsBiasAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/wellbeing" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><WellbeingCoach /></Suspense></ProtectedRoute>} />
          <Route path="/agents/focus-flow" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><FocusFlowAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/workspace-ergonomics" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><WorkspaceErgonomics /></Suspense></ProtectedRoute>} />
          <Route path="/agents/creative" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><CreativeAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/social-media" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><SocialMediaAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/translation" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><TranslationAgent /></Suspense></ProtectedRoute>} />
          <Route path="/agents/customer-service" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><CustomerServiceAgent /></Suspense></ProtectedRoute>} />

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
      <Sonner />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
