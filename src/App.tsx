import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WellbeingProvider } from './contexts/WellbeingContext';
import { MoodPromptModal } from './components/wellbeing/MoodPromptModal';
import { CoachBubble } from './components/wellbeing/CoachBubble';
import { ProtectedRoute } from './components/ProtectedRoute';
import SuperadminRoute from './components/admin/SuperadminRoute';
import RequireCap from './components/workspace/RequireCap';
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
import MyAgents from "./pages/MyAgents";
import AgentDetail from "./pages/AgentDetail";
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
import Security from "./pages/Security";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Projects from "./pages/Projects";
import Notifications from "./pages/Notifications";
import Audit from "./pages/Audit";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Invites from "./pages/Invites";
import InviteAccept from "./pages/InviteAccept";
import Organization from "./pages/Organization";
import IntegrationsHub from "./pages/IntegrationsHub";
import IntegrationDetail from "./pages/IntegrationDetail";
import OAuthCallback from "./pages/OAuthCallback";
import Enterprise from "./pages/Enterprise";
import OpayPaymentDemo from "./pages/OpayPaymentDemo";

// Autonomous brain — daily morning + evening digest pipeline.
import BrainPreferences from "./pages/BrainPreferences";
import BrainRuns from "./pages/BrainRuns";
import BrainRunDetail from "./pages/BrainRunDetail";

// Lumicoria Meet — per-org meeting branding admin.
import MeetingBranding from "./pages/settings/MeetingBranding";
// Recording playback page for completed huddles.
import HuddleRecording from "./pages/huddle/HuddleRecording";

// Workspace surface (Phase G)
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
const WorkspaceLayoutLazy = lazy(() => import("./components/workspace/WorkspaceLayout").then(m => ({ default: m.WorkspaceLayout })));
const WorkspaceHome = lazy(() => import("./pages/workspace/WorkspaceHome"));
const WorkspaceMembers = lazy(() => import("./pages/workspace/WorkspaceMembers"));
const WorkspaceActivity = lazy(() => import("./pages/workspace/WorkspaceActivity"));
const TeamsList = lazy(() => import("./pages/workspace/TeamsList"));
const TeamDetail = lazy(() => import("./pages/workspace/TeamDetail"));
const ProjectsList = lazy(() => import("./pages/workspace/ProjectsList"));
const ProjectDetail = lazy(() => import("./pages/workspace/ProjectDetail"));
const AdminBilling = lazy(() => import("./pages/workspace/admin/AdminBilling"));
const AdminAudit = lazy(() => import("./pages/workspace/admin/AdminAudit"));
const AdminTokens = lazy(() => import("./pages/workspace/admin/AdminTokens"));
const AdminWebhooks = lazy(() => import("./pages/workspace/admin/AdminWebhooks"));
const AdminSso = lazy(() => import("./pages/workspace/admin/AdminSso"));
const AdminScim = lazy(() => import("./pages/workspace/admin/AdminScim"));
const AdminDomains = lazy(() => import("./pages/workspace/admin/AdminDomains"));
const AdminSecurity = lazy(() => import("./pages/workspace/admin/AdminSecurity"));
const AdminAutomations = lazy(() => import("./pages/workspace/admin/AdminAutomations"));
const AdminNotifications = lazy(() => import("./pages/workspace/admin/AdminNotifications"));
const AdminBranding = lazy(() => import("./pages/workspace/admin/AdminBranding"));
const AdminIntegrations = lazy(() => import("./pages/workspace/admin/AdminIntegrations"));
const AdminAnnouncements = lazy(() => import("./pages/workspace/admin/AdminAnnouncements"));
const AdminTags = lazy(() => import("./pages/workspace/admin/AdminTags"));
const AdminCustomRoles = lazy(() => import("./pages/workspace/admin/AdminCustomRoles"));
const AdminEmails = lazy(() => import("./pages/workspace/admin/AdminEmails"));
const AdminResidency = lazy(() => import("./pages/workspace/admin/AdminResidency"));
const AdminCompliance = lazy(() => import("./pages/workspace/admin/AdminCompliance"));
const AdminJit = lazy(() => import("./pages/workspace/admin/AdminJit"));
const AdminCredits = lazy(() => import("./pages/workspace/admin/AdminCredits"));
const AdminContracts = lazy(() => import("./pages/workspace/admin/AdminContracts"));
const AdminOnboardingChecklist = lazy(() => import("./pages/workspace/admin/AdminOnboardingChecklist"));
const WorkspaceSearch = lazy(() => import("./pages/workspace/WorkspaceSearch"));
const WorkspaceCalendar = lazy(() => import("./pages/workspace/WorkspaceCalendar"));
const WorkspaceDashboards = lazy(() => import("./pages/workspace/WorkspaceDashboards"));
const WorkspaceExports = lazy(() => import("./pages/workspace/WorkspaceExports"));
const NotificationRules = lazy(() => import("./pages/workspace/NotificationRules"));
const PendingReviews = lazy(() => import("./pages/workspace/PendingReviews"));
const CommandPalette = lazy(() => import("./components/workspace/CommandPalette"));

// Agent pages — lazy loaded
const DocumentAgent = lazy(() => import("./pages/agents/DocumentAgent"));
const MeetingAssistant = lazy(() => import("./pages/agents/MeetingAssistant"));
const MeetingFactChecker = lazy(() => import("./pages/agents/MeetingFactChecker"));
const MeetingRoom = lazy(() => import("./pages/agents/MeetingRoom"));
const HuddleLobby = lazy(() => import("./pages/agents/HuddleLobby"));
const HuddleSchedule = lazy(() => import("./pages/agents/HuddleSchedule"));
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

// Platform superadmin portal — separate from /workspace/admin/*.
const PlatformAdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const PlatformAdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const PlatformAdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const PlatformAdminOrgs = lazy(() => import("./pages/admin/AdminOrgs"));
const PlatformAdminAgents = lazy(() => import("./pages/admin/AdminAgents"));
const PlatformAdminFinance = lazy(() => import("./pages/admin/AdminFinance"));
const PlatformAdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const PlatformAdminEmail = lazy(() => import("./pages/admin/AdminEmail"));
const PlatformAdminSystem = lazy(() => import("./pages/admin/AdminSystem"));
const PlatformAdminAudit = lazy(() => import("./pages/admin/AdminAudit"));

// Public hosted support portal — NO ProtectedRoute, NO MainLayout (full-bleed, branded).
const SupportPortal = lazy(() => import("./pages/portal/SupportPortal"));
const SupportPortalStatus = lazy(() => import("./pages/portal/SupportPortalStatus"));
const SupportPortalHelp = lazy(() => import("./pages/portal/SupportPortalHelp"));
const SupportPortalArticle = lazy(() => import("./pages/portal/SupportPortalArticle"));

// Documentation — lazy loaded
const DocsLayout = lazy(() => import("./pages/docs/DocsLayout"));

// Blog — lazy loaded
const BlogListing = lazy(() => import("./pages/BlogListing"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const BlogEditor = lazy(() => import("./pages/BlogEditor"));
const BlogMyPosts = lazy(() => import("./pages/BlogMyPosts"));

const AgentPageFallback = () => (
  <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-lumicoria-purple rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading agent...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const elementId = decodeURIComponent(hash.slice(1));
      window.requestAnimationFrame(() => {
        document.getElementById(elementId)?.scrollIntoView({ block: 'start' });
      });
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
};

/** Standard app shell: MainNav + content + Footer */
const MainLayout = () => {
  // Meeting room: nav auto-collapses (see MainNav), so drop the top
  // padding and let the call use the full viewport height.
  const { pathname } = useLocation();
  const isMeetingRoom = pathname.startsWith("/agents/meeting/room");
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNav />
      <main className={isMeetingRoom ? "flex-1" : "flex-1 pt-16"}>
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      <Sonner />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Blog post page — standalone layout with BlogNav (no MainNav/Footer) */}
      <Route path="/blog/:slug" element={<Suspense fallback={<AgentPageFallback />}><BlogPostPage /></Suspense>} />

      {/* Enterprise marketing — full-bleed, no MainNav/Footer */}
      <Route path="/enterprise" element={<Enterprise />} />

      {/* OPay Innovation Challenge payment demo - full-bleed, no MainNav/Footer */}
      <Route path="/opay-payment" element={<OpayPaymentDemo />} />

      {/* Public hosted support portal — full-bleed, branded, NO MainLayout. */}
      <Route path="/portal/:slug" element={<Suspense fallback={<AgentPageFallback />}><SupportPortal /></Suspense>} />
      <Route path="/portal/:slug/status/:ticket_id" element={<Suspense fallback={<AgentPageFallback />}><SupportPortalStatus /></Suspense>} />
      <Route path="/portal/:slug/help" element={<Suspense fallback={<AgentPageFallback />}><SupportPortalHelp /></Suspense>} />
      <Route path="/portal/:slug/help/:article_slug" element={<Suspense fallback={<AgentPageFallback />}><SupportPortalArticle /></Suspense>} />

      {/* All other routes — MainNav + Footer layout */}
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/agents" element={<AgentsUniverse />} />
        <Route path="/live-studio" element={<LiveStudio />} />
        <Route path="/agent-builder" element={<AgentBuilder />} />
        <Route path="/agents/my-agents" element={<ProtectedRoute><MyAgents /></ProtectedRoute>} />
        <Route path="/agents/my-agents/:agentId" element={<ProtectedRoute><AgentDetail /></ProtectedRoute>} />
        <Route path="/wellbeing" element={<ProtectedRoute><NewWellbeing /></ProtectedRoute>} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/pricing/teams" element={<Pricing />} />
        <Route path="/models" element={<Models />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* Blog — inside MainLayout */}
        <Route path="/blog" element={<Suspense fallback={<AgentPageFallback />}><BlogListing /></Suspense>} />
        <Route path="/blog/my-posts" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><BlogMyPosts /></Suspense></ProtectedRoute>} />
        <Route path="/blog/write" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><BlogEditor /></Suspense></ProtectedRoute>} />
        <Route path="/blog/edit/:id" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><BlogEditor /></Suspense></ProtectedRoute>} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Platform superadmin portal — true /admin, not workspace/org admin. */}
        <Route
          path="/admin"
          element={<SuperadminRoute><Suspense fallback={<AgentPageFallback />}><PlatformAdminLayout /></Suspense></SuperadminRoute>}
        >
          <Route index element={<Suspense fallback={<AgentPageFallback />}><PlatformAdminOverview /></Suspense>} />
          <Route path="users" element={<Suspense fallback={<AgentPageFallback />}><PlatformAdminUsers /></Suspense>} />
          <Route path="orgs" element={<Suspense fallback={<AgentPageFallback />}><PlatformAdminOrgs /></Suspense>} />
          <Route path="agents" element={<Suspense fallback={<AgentPageFallback />}><PlatformAdminAgents /></Suspense>} />
          <Route path="finance" element={<Suspense fallback={<AgentPageFallback />}><PlatformAdminFinance /></Suspense>} />
          <Route path="messages" element={<Suspense fallback={<AgentPageFallback />}><PlatformAdminMessages /></Suspense>} />
          <Route path="email" element={<Suspense fallback={<AgentPageFallback />}><PlatformAdminEmail /></Suspense>} />
          <Route path="system" element={<Suspense fallback={<AgentPageFallback />}><PlatformAdminSystem /></Suspense>} />
          <Route path="audit" element={<Suspense fallback={<AgentPageFallback />}><PlatformAdminAudit /></Suspense>} />
        </Route>

        {/* Workspace surface — Phase G (Protected, lazy-loaded) */}
        <Route path="/workspace" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><WorkspaceLayoutLazy /></Suspense></ProtectedRoute>}>
          <Route index element={<Suspense fallback={<AgentPageFallback />}><WorkspaceHome /></Suspense>} />
          <Route path="members" element={<Suspense fallback={<AgentPageFallback />}><WorkspaceMembers /></Suspense>} />
          <Route path="activity" element={<Suspense fallback={<AgentPageFallback />}><WorkspaceActivity /></Suspense>} />
          <Route path="teams" element={<Suspense fallback={<AgentPageFallback />}><TeamsList /></Suspense>} />
          <Route path="teams/new" element={<Suspense fallback={<AgentPageFallback />}><TeamsList /></Suspense>} />
          <Route path="teams/:teamId" element={<Suspense fallback={<AgentPageFallback />}><TeamDetail /></Suspense>} />
          <Route path="projects" element={<Suspense fallback={<AgentPageFallback />}><ProjectsList /></Suspense>} />
          <Route path="projects/new" element={<Suspense fallback={<AgentPageFallback />}><ProjectsList /></Suspense>} />
          <Route path="projects/:projectId" element={<Suspense fallback={<AgentPageFallback />}><ProjectDetail /></Suspense>} />
          <Route path="admin/billing" element={<RequireCap cap="manage_billing"><Suspense fallback={<AgentPageFallback />}><AdminBilling /></Suspense></RequireCap>} />
          <Route path="admin/audit" element={<RequireCap cap="view_audit"><Suspense fallback={<AgentPageFallback />}><AdminAudit /></Suspense></RequireCap>} />
          <Route path="admin/api-tokens" element={<RequireCap cap="manage_api_tokens"><Suspense fallback={<AgentPageFallback />}><AdminTokens /></Suspense></RequireCap>} />
          <Route path="admin/webhooks" element={<RequireCap cap="manage_webhooks"><Suspense fallback={<AgentPageFallback />}><AdminWebhooks /></Suspense></RequireCap>} />
          <Route path="admin/sso" element={<RequireCap cap="manage_sso"><Suspense fallback={<AgentPageFallback />}><AdminSso /></Suspense></RequireCap>} />
          <Route path="admin/scim" element={<RequireCap cap="manage_scim"><Suspense fallback={<AgentPageFallback />}><AdminScim /></Suspense></RequireCap>} />
          <Route path="admin/domains" element={<RequireCap cap="manage_custom_domains"><Suspense fallback={<AgentPageFallback />}><AdminDomains /></Suspense></RequireCap>} />
          <Route path="admin/security" element={<RequireCap cap="manage_enterprise_features"><Suspense fallback={<AgentPageFallback />}><AdminSecurity /></Suspense></RequireCap>} />
          <Route path="admin/automations" element={<RequireCap cap="manage_automations"><Suspense fallback={<AgentPageFallback />}><AdminAutomations /></Suspense></RequireCap>} />
          <Route path="admin/notifications" element={<RequireCap cap="manage_settings"><Suspense fallback={<AgentPageFallback />}><AdminNotifications /></Suspense></RequireCap>} />
          <Route path="admin/branding" element={<RequireCap cap="manage_branding"><Suspense fallback={<AgentPageFallback />}><AdminBranding /></Suspense></RequireCap>} />
          <Route path="admin/integrations" element={<RequireCap cap="manage_integrations"><Suspense fallback={<AgentPageFallback />}><AdminIntegrations /></Suspense></RequireCap>} />
          <Route path="admin/announcements" element={<RequireCap cap="manage_settings"><Suspense fallback={<AgentPageFallback />}><AdminAnnouncements /></Suspense></RequireCap>} />
          <Route path="admin/tags" element={<RequireCap cap="manage_settings"><Suspense fallback={<AgentPageFallback />}><AdminTags /></Suspense></RequireCap>} />
          <Route path="admin/custom-roles" element={<RequireCap cap="manage_enterprise_features"><Suspense fallback={<AgentPageFallback />}><AdminCustomRoles /></Suspense></RequireCap>} />
          <Route path="admin/emails" element={<RequireCap cap="manage_settings"><Suspense fallback={<AgentPageFallback />}><AdminEmails /></Suspense></RequireCap>} />
          <Route path="admin/residency" element={<RequireCap cap="manage_enterprise_features"><Suspense fallback={<AgentPageFallback />}><AdminResidency /></Suspense></RequireCap>} />
          <Route path="admin/compliance" element={<RequireCap cap="manage_enterprise_features"><Suspense fallback={<AgentPageFallback />}><AdminCompliance /></Suspense></RequireCap>} />
          <Route path="admin/jit" element={<RequireCap cap="manage_enterprise_features"><Suspense fallback={<AgentPageFallback />}><AdminJit /></Suspense></RequireCap>} />
          <Route path="admin/credits" element={<RequireCap cap="manage_billing"><Suspense fallback={<AgentPageFallback />}><AdminCredits /></Suspense></RequireCap>} />
          <Route path="admin/contracts" element={<RequireCap cap="manage_billing"><Suspense fallback={<AgentPageFallback />}><AdminContracts /></Suspense></RequireCap>} />
          <Route path="admin/onboarding-checklist" element={<RequireCap cap="manage_settings"><Suspense fallback={<AgentPageFallback />}><AdminOnboardingChecklist /></Suspense></RequireCap>} />
          <Route path="search" element={<Suspense fallback={<AgentPageFallback />}><WorkspaceSearch /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<AgentPageFallback />}><WorkspaceCalendar /></Suspense>} />
          <Route path="dashboards" element={<Suspense fallback={<AgentPageFallback />}><WorkspaceDashboards /></Suspense>} />
          <Route path="exports" element={<Suspense fallback={<AgentPageFallback />}><WorkspaceExports /></Suspense>} />
          <Route path="notifications/rules" element={<Suspense fallback={<AgentPageFallback />}><NotificationRules /></Suspense>} />
          <Route path="reviews" element={<Suspense fallback={<AgentPageFallback />}><PendingReviews /></Suspense>} />
        </Route>

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
        <Route path="/security/activity" element={<ProtectedRoute><Security /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute><Audit /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/invites" element={<ProtectedRoute><Invites /></ProtectedRoute>} />
        <Route path="/organization" element={<ProtectedRoute><Organization /></ProtectedRoute>} />
        {/* Public — token is the credential */}
        <Route path="/invites/accept" element={<InviteAccept />} />
        <Route path="/integrations" element={<ProtectedRoute><IntegrationsHub /></ProtectedRoute>} />
        <Route path="/integrations/:type" element={<ProtectedRoute><IntegrationDetail /></ProtectedRoute>} />
        <Route path="/integrations/oauth/callback" element={<OAuthCallback />} />

        {/* Autonomous brain — daily morning + evening digest */}
        <Route path="/brain" element={<ProtectedRoute><BrainPreferences /></ProtectedRoute>} />
        <Route path="/brain/preferences" element={<ProtectedRoute><BrainPreferences /></ProtectedRoute>} />

        {/* Lumicoria Meet — per-org meeting branding (logo, colors, app name). */}
        <Route path="/settings/meeting-branding" element={<ProtectedRoute><MeetingBranding /></ProtectedRoute>} />

        {/* Recording playback for completed huddles. */}
        <Route path="/huddles/:huddleId/recording" element={<ProtectedRoute><HuddleRecording /></ProtectedRoute>} />
        <Route path="/brain/runs" element={<ProtectedRoute><BrainRuns /></ProtectedRoute>} />
        <Route path="/brain/runs/:runId" element={<ProtectedRoute><BrainRunDetail /></ProtectedRoute>} />

        {/* Agent Pages */}
        <Route path="/agents/document" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><DocumentAgent /></Suspense></ProtectedRoute>} />
        <Route path="/agents/meeting" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><MeetingAssistant /></Suspense></ProtectedRoute>} />
        {/* NOT wrapped in ProtectedRoute: guests arrive here from the public
            share-link lobby with ?share_token=. Access control lives
            server-side — GET /huddles/{id} 404s for anonymous callers
            without a valid token, and MeetingRoom renders its error state. */}
        <Route path="/agents/meeting/room/:huddleId" element={<Suspense fallback={<AgentPageFallback />}><MeetingRoom /></Suspense>} />
        <Route path="/huddles/schedule" element={<ProtectedRoute><Suspense fallback={<AgentPageFallback />}><HuddleSchedule /></Suspense></ProtectedRoute>} />
        <Route path="/huddles/join/:shareToken" element={<Suspense fallback={<AgentPageFallback />}><HuddleLobby /></Suspense>} />
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

        {/* Documentation (public) */}
        <Route path="/docs/*" element={<Suspense fallback={<AgentPageFallback />}><DocsLayout /></Suspense>} />

        {/* Catch-all Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <WorkspaceProvider>
            <PermissionsProvider>
              <NotificationsProvider>
                <RealtimeProvider>
                  <WellbeingProvider>
                    <AppRoutes />
                    <MoodPromptModal />
                    <CoachBubble />
                    <Suspense fallback={null}><CommandPalette /></Suspense>
                  </WellbeingProvider>
                </RealtimeProvider>
              </NotificationsProvider>
            </PermissionsProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
