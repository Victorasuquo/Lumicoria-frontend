import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import DocumentPreview, {
  CitationHighlight,
} from "@/components/DocumentPreview";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";
import type {
  DocumentPreviewDescriptor,
  XlsxSheet,
} from "@/services/api";

interface Props {
  descriptor: DocumentPreviewDescriptor;
  isOpen: boolean;
  onClose: () => void;
  /** PDF-only: page to jump to + citation bboxes. */
  initialPage?: number;
  highlights?: CitationHighlight[];
}

/**
 * Unified preview renderer — dispatches by descriptor.type.
 *
 * The backend (GET /chat/documents/{id}/preview) returns a discriminated
 * union describing how the document should render.  We delegate PDFs to
 * the existing DocumentPreview (which already handles citations); all
 * other formats render in a single modal shell here.
 */
const PreviewRenderer: React.FC<Props> = ({
  descriptor,
  isOpen,
  onClose,
  initialPage,
  highlights,
}) => {
  if (!isOpen) return null;

  // PDFs reuse the existing full-featured viewer.
  if (descriptor.type === "pdf" && descriptor.url) {
    return (
      <DocumentPreview
        documentUrl={descriptor.url}
        isOpen={isOpen}
        onClose={onClose}
        initialPage={initialPage}
        highlights={highlights}
      />
    );
  }

  return (
    <Shell
      title={descriptor.title || descriptor.filename || "Preview"}
      onClose={onClose}
      downloadUrl={
        descriptor.type !== "markdown" &&
        descriptor.type !== "code" &&
        descriptor.type !== "text"
          ? descriptor.url
          : undefined
      }
      externalUrl={descriptor.source_url || undefined}
    >
      <Body descriptor={descriptor} />
    </Shell>
  );
};

export default PreviewRenderer;

// ── Modal shell ─────────────────────────────────────────────────────

const Shell: React.FC<{
  title: string;
  onClose: () => void;
  downloadUrl?: string;
  externalUrl?: string;
  children: React.ReactNode;
}> = ({ title, onClose, downloadUrl, externalUrl, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="relative flex h-[85vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl dark:bg-zinc-900">
      <header className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <h2 className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <div className="flex items-center gap-1">
          {externalUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={externalUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          {downloadUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={downloadUrl} download>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  </div>
);

// ── Per-type body ───────────────────────────────────────────────────

const Body: React.FC<{ descriptor: DocumentPreviewDescriptor }> = ({
  descriptor,
}) => {
  switch (descriptor.type) {
    case "image":
      return (
        <div className="flex h-full items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
          {descriptor.url && (
            <img
              src={descriptor.url}
              alt={descriptor.title || descriptor.filename || "image"}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
      );

    case "html":
      return <HtmlFrame descriptor={descriptor} />;

    case "xlsx":
      return <XlsxTable descriptor={descriptor} />;

    case "markdown":
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none p-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {typeof descriptor.data === "string" ? descriptor.data : ""}
          </ReactMarkdown>
        </div>
      );

    case "code":
      return (
        <pre className="m-0 h-full overflow-auto bg-zinc-950 p-4 text-xs leading-relaxed text-zinc-100">
          <code className={`language-${descriptor.language || "text"}`}>
            {typeof descriptor.data === "string" ? descriptor.data : ""}
          </code>
        </pre>
      );

    case "text":
      return (
        <pre className="m-0 h-full overflow-auto whitespace-pre-wrap p-6 font-mono text-sm text-zinc-800 dark:text-zinc-100">
          {typeof descriptor.data === "string" ? descriptor.data : ""}
        </pre>
      );

    case "download":
    default:
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm text-zinc-500">
            Preview not available for this file type.
          </p>
          {descriptor.url && (
            <Button asChild>
              <a href={descriptor.url} download>
                Download {descriptor.filename || "file"}
              </a>
            </Button>
          )}
        </div>
      );
  }
};

// ── HTML (DOCX/PPTX preview artifacts + URL snapshots) ─────────────

const HtmlFrame: React.FC<{ descriptor: DocumentPreviewDescriptor }> = ({
  descriptor,
}) => {
  if (!descriptor.url) {
    return (
      <div className="p-6 text-sm text-zinc-500">Preview unavailable.</div>
    );
  }
  // Sandboxed iframe: no scripts, no same-origin access, just render the HTML.
  return (
    <iframe
      src={descriptor.url}
      title={descriptor.title || descriptor.filename || "preview"}
      sandbox=""
      className="h-full w-full bg-white"
    />
  );
};

// ── XLSX (inline JSON → tabbed tables) ─────────────────────────────

const XlsxTable: React.FC<{ descriptor: DocumentPreviewDescriptor }> = ({
  descriptor,
}) => {
  const sheets: XlsxSheet[] = useMemo(() => {
    const d = descriptor.data;
    if (d && typeof d === "object" && "sheets" in d) {
      return d.sheets;
    }
    return [];
  }, [descriptor.data]);

  const [activeIdx, setActiveIdx] = useState(0);

  if (sheets.length === 0) {
    return (
      <div className="p-6 text-sm text-zinc-500">
        Spreadsheet preview unavailable.
        {descriptor.url && (
          <a
            href={descriptor.url}
            download
            className="ml-2 underline underline-offset-2"
          >
            Download original
          </a>
        )}
      </div>
    );
  }

  const sheet = sheets[activeIdx] || sheets[0];

  return (
    <div className="flex h-full flex-col">
      <div className="flex overflow-x-auto border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
        {sheets.map((s, i) => (
          <button
            key={s.name + i}
            onClick={() => setActiveIdx(i)}
            className={`whitespace-nowrap px-3 py-2 text-xs font-medium transition ${
              i === activeIdx
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800">
            <tr>
              {sheet.headers.map((h, i) => (
                <th
                  key={i}
                  className="border border-zinc-300 px-2 py-1 text-left font-semibold dark:border-zinc-700"
                >
                  {h == null ? "" : String(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, ri) => (
              <tr key={ri} className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-950">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="border border-zinc-300 px-2 py-1 dark:border-zinc-700"
                  >
                    {cell == null ? "" : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {sheet.truncated && (
          <p className="px-3 py-2 text-[11px] text-zinc-500">
            Large sheet — rows truncated. Download the original for the full data.
          </p>
        )}
      </div>
    </div>
  );
};
