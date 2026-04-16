import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import DocsContentRenderer from "@/components/docs/DocsContentRenderer";
import DocsPagination from "@/components/docs/DocsPagination";
import { getSection, docSections } from "@/data/docs/sections/index";

const DocsSectionPage: React.FC = () => {
  const { sectionSlug } = useParams<{ sectionSlug?: string }>();
  const slug = sectionSlug || "agents";
  const section = getSection(slug);

  if (!section) {
    return <Navigate to="/docs" replace />;
  }

  // For now, render the first (and often only) subpage
  const subpage = section.subpages[0];
  if (!subpage) {
    return <Navigate to="/docs" replace />;
  }

  // Build prev/next pagination across sections
  const sectionIndex = docSections.indexOf(section);
  const prevSection = sectionIndex > 0 ? docSections[sectionIndex - 1] : null;
  const nextSection = sectionIndex < docSections.length - 1 ? docSections[sectionIndex + 1] : null;

  return (
    <div className="max-w-3xl">
      <DocsBreadcrumb />

      <motion.div
        key={slug}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DocsContentRenderer blocks={subpage.content} />
      </motion.div>

      <DocsPagination
        prev={prevSection ? { label: prevSection.title, href: `/docs/${prevSection.slug}` } : null}
        next={nextSection ? { label: nextSection.title, href: `/docs/${nextSection.slug}` } : null}
      />
    </div>
  );
};

export default DocsSectionPage;
