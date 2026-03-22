import React, { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Configure pdf.js worker — use CDN to avoid Vite cache version mismatches
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export interface CitationHighlight {
  pageNumber: number;
  bbox?: [number, number, number, number]; // [x0, y0, x1, y1] from PyMuPDF
  pageWidth?: number;
  pageHeight?: number;
  text?: string; // fallback: text-search highlight
}

interface DocumentPreviewProps {
  documentUrl: string;
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number;
  highlights?: CitationHighlight[];
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documentUrl,
  isOpen,
  onClose,
  initialPage = 1,
  highlights = [],
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Jump to page when initialPage changes
  useEffect(() => {
    if (initialPage && initialPage !== currentPage) {
      setCurrentPage(initialPage);
      scrollToPage(initialPage);
    }
  }, [initialPage]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total);
      setLoading(false);
      if (initialPage > 1) {
        setTimeout(() => scrollToPage(initialPage), 200);
      }
    },
    [initialPage],
  );

  const scrollToPage = (page: number) => {
    const el = pageRefs.current.get(page);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goToPage = (page: number) => {
    const target = Math.max(1, Math.min(page, numPages));
    setCurrentPage(target);
    scrollToPage(target);
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));
  const zoomFit = () => setScale(1.2);

  // Render highlight overlays for a given page
  const renderHighlights = (pageNumber: number) => {
    const pageHighlights = highlights.filter(
      (h) => h.pageNumber === pageNumber,
    );
    if (pageHighlights.length === 0) return null;

    return pageHighlights.map((h, i) => {
      if (!h.bbox || !h.pageWidth || !h.pageHeight) return null;

      const [x0, y0, x1, y1] = h.bbox;
      const left = (x0 / h.pageWidth) * 100;
      const top = (y0 / h.pageHeight) * 100;
      const width = ((x1 - x0) / h.pageWidth) * 100;
      const height = ((y1 - y0) / h.pageHeight) * 100;

      return (
        <div
          key={i}
          className="absolute pointer-events-none rounded-sm"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
            backgroundColor: "rgba(124, 58, 237, 0.18)",
            border: "2px solid rgba(124, 58, 237, 0.5)",
          }}
        />
      );
    });
  };

  // Custom text renderer for text-search highlighting
  const textRenderer = useCallback(
    (textItem: { str: string }) => {
      const textHighlights = highlights.filter(
        (h) => h.text && !h.bbox,
      );
      if (textHighlights.length === 0) return textItem.str;

      let result = textItem.str;
      for (const h of textHighlights) {
        if (h.text && result.toLowerCase().includes(h.text.toLowerCase())) {
          const regex = new RegExp(`(${h.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
          result = result.replace(regex, `<mark class="bg-violet-200/60 rounded px-0.5">$1</mark>`);
        }
      }
      return result;
    },
    [highlights],
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-[90vw] max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {numPages || "..."}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft size={16} />
                </Button>
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-12 h-8 text-center text-xs border border-gray-200 rounded-lg bg-gray-50"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= numPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight size={16} />
                </Button>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                <Button variant="ghost" size="sm" onClick={zoomOut} className="h-8 w-8 p-0">
                  <ZoomOut size={14} />
                </Button>
                <span className="text-xs text-gray-500 w-10 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button variant="ghost" size="sm" onClick={zoomIn} className="h-8 w-8 p-0">
                  <ZoomIn size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={zoomFit} className="h-8 w-8 p-0">
                  <Maximize2 size={14} />
                </Button>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* PDF Content */}
            <div
              ref={containerRef}
              className="flex-1 overflow-auto bg-gray-100 p-4"
            >
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-violet-500 rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">Loading document...</span>
                  </div>
                </div>
              )}

              <Document
                file={documentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) => {
                  console.error("PDF load error:", err);
                  setLoading(false);
                }}
                loading=""
              >
                {Array.from({ length: numPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <div
                      key={pageNum}
                      ref={(el) => {
                        if (el) pageRefs.current.set(pageNum, el);
                      }}
                      className="relative mb-4 mx-auto shadow-lg bg-white"
                      style={{ width: "fit-content" }}
                    >
                      <Page
                        pageNumber={pageNum}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        customTextRenderer={textRenderer}
                        onRenderSuccess={() => {
                          // Update current page on scroll
                          if (containerRef.current) {
                            const el = pageRefs.current.get(pageNum);
                            if (el) {
                              const rect = el.getBoundingClientRect();
                              const container =
                                containerRef.current.getBoundingClientRect();
                              if (
                                rect.top >= container.top &&
                                rect.top < container.top + container.height / 2
                              ) {
                                setCurrentPage(pageNum);
                              }
                            }
                          }
                        }}
                      />
                      {/* Highlight overlays */}
                      {renderHighlights(pageNum)}
                    </div>
                  ),
                )}
              </Document>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DocumentPreview;
