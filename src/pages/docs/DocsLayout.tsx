import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { DesktopSidebar, MobileSidebarTrigger } from "@/components/docs/DocsSidebar";

const DocsIndex = lazy(() => import("./DocsIndex"));
const DocsAgentPage = lazy(() => import("./DocsAgentPage"));
const DocsSectionPage = lazy(() => import("./DocsSectionPage"));

const PageFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-6 h-6 border-2 border-gray-200 border-t-lumicoria-purple rounded-full animate-spin" />
  </div>
);

const DocsLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <MobileSidebarTrigger />
      <div className="flex max-w-[1400px] mx-auto">
        <DesktopSidebar />
        <main className="flex-1 min-w-0 px-6 lg:px-12 py-8">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route index element={<DocsIndex />} />
              <Route path="agents" element={<DocsSectionPage />} />
              <Route path="agents/:agentSlug" element={<DocsAgentPage />} />
              <Route path="agents/:agentSlug/:subpageSlug" element={<DocsAgentPage />} />
              <Route path=":sectionSlug" element={<DocsSectionPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DocsLayout;
