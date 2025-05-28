import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainNav from "@/components/MainNav";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AgentsUniverse from "./pages/AgentsUniverse";
import LiveStudio from "./pages/LiveStudio";
import AgentBuilder from "./pages/AgentBuilder";
import Wellbeing from "./pages/Wellbeing";
import NewWellbeing from "./pages/NewWellbeing";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NewLogin from "./pages/NewLogin";
import NewSignup from "./pages/NewSignup";
import Dashboard from "./pages/Dashboard";
import NewDashboard from "./pages/NewDashboard";
import Profile from "@/pages/Profile";
import Onboarding from "@/pages/Onboarding";
import Settings from "./pages/Settings";
import Documents from "./pages/Documents";

const queryClient = new QueryClient();

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <main className="pt-16">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/agents" element={<AgentsUniverse />} />
          <Route path="/live-studio" element={<LiveStudio />} />
          <Route path="/agent-builder" element={<AgentBuilder />} />
          <Route path="/wellbeing" element={<NewWellbeing />} />
          <Route path="/pricing" element={<Pricing />} />
            {/* Auth Routes */}
          <Route path="/login" element={<NewLogin />} />
          <Route path="/signup" element={<NewSignup />} />
          
          {/* Protected Routes */}          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <NewDashboard />
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
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
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
