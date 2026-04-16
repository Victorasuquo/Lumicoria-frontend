import React, { useState } from "react";
import { ExternalLink, Info, AlertTriangle, Lightbulb, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { DocContentBlock } from "@/data/docs/types";

// ── Inline text formatting (bold + links) ────────────────────────

const renderInline = (text: string) => {
  // Process **bold** and [link text](url)
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={match.index} className="font-semibold text-gray-900">{match[1]}</strong>);
    } else if (match[2] && match[3]) {
      const isExternal = match[3].startsWith("http");
      if (isExternal) {
        parts.push(
          <a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-lumicoria-purple hover:underline inline-flex items-center gap-1">
            {match[2]}<ExternalLink size={11} />
          </a>
        );
      } else {
        parts.push(
          <Link key={match.index} to={match[3]} className="text-lumicoria-purple hover:underline">
            {match[2]}
          </Link>
        );
      }
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
};

// ── Screenshot with lightbox ─────────────────────────────────────

const Screenshot: React.FC<{ url: string; alt: string; caption?: string }> = ({ url, alt, caption }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <figure className="my-6">
        <div
          onClick={() => setOpen(true)}
          className="cursor-pointer rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-50"
        >
          <img src={url} alt={alt} loading="lazy" className="w-full h-auto" />
        </div>
        {caption && (
          <figcaption className="mt-2 text-center text-xs text-gray-400">{caption}</figcaption>
        )}
      </figure>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-white">
          <img src={url} alt={alt} className="w-full h-auto rounded-lg" />
          {caption && <p className="text-center text-sm text-gray-500 mt-2">{caption}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
};

// ── Callout box ──────────────────────────────────────────────────

const calloutStyles = {
  info: { bg: "bg-blue-50 border-blue-200", icon: Info, iconColor: "text-blue-500", title: "text-blue-800" },
  warning: { bg: "bg-amber-50 border-amber-200", icon: AlertTriangle, iconColor: "text-amber-500", title: "text-amber-800" },
  tip: { bg: "bg-emerald-50 border-emerald-200", icon: Lightbulb, iconColor: "text-emerald-500", title: "text-emerald-800" },
};

// ── Capability card icon resolver ────────────────────────────────

const resolveIcon = (name: string, size = 18) => {
  const IconComp = (Icons as Record<string, React.FC<{ size?: number; className?: string }>>)[name];
  return IconComp ? <IconComp size={size} /> : null;
};

// ── Main renderer ────────────────────────────────────────────────

const DocsContentRenderer: React.FC<{ blocks: DocContentBlock[] }> = ({ blocks }) => {
  return (
    <div className="docs-content">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const Tag = `h${block.level}` as "h2" | "h3" | "h4";
            const sizes = { 2: "text-2xl font-bold mt-10 mb-4", 3: "text-lg font-semibold mt-8 mb-3", 4: "text-base font-medium mt-6 mb-2" };
            return (
              <Tag key={i} id={block.id} className={`${sizes[block.level]} text-gray-900 scroll-mt-20`}>
                <a href={`#${block.id}`} className="hover:text-lumicoria-purple transition-colors">
                  {block.text}
                </a>
              </Tag>
            );
          }

          case "paragraph":
            return (
              <p key={i} className="text-[15px] text-gray-600 leading-relaxed mb-4">
                {renderInline(block.text)}
              </p>
            );

          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={i}
                className={`mb-4 space-y-1.5 text-[15px] text-gray-600 ${
                  block.ordered ? "list-decimal" : "list-disc"
                } pl-6`}
              >
                {block.items.map((item, j) => (
                  <li key={j} className="leading-relaxed">{renderInline(item)}</li>
                ))}
              </ListTag>
            );
          }

          case "callout": {
            const style = calloutStyles[block.variant];
            const CalloutIcon = style.icon;
            return (
              <div key={i} className={`${style.bg} border rounded-xl p-4 mb-6 flex gap-3`}>
                <CalloutIcon size={18} className={`${style.iconColor} shrink-0 mt-0.5`} />
                <div>
                  <p className={`text-sm font-semibold ${style.title} mb-1`}>{block.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{renderInline(block.text)}</p>
                </div>
              </div>
            );
          }

          case "code":
            return (
              <pre key={i} className="mb-6 rounded-xl bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed">
                <code>{block.code}</code>
              </pre>
            );

          case "screenshot":
            return <Screenshot key={i} url={block.url} alt={block.alt} caption={block.caption} />;

          case "capabilities":
            return (
              <div key={i} className="grid sm:grid-cols-2 gap-3 mb-6">
                {block.items.map((cap, j) => (
                  <div key={j} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-lumicoria-purple">
                        {resolveIcon(cap.icon)}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">{cap.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{cap.description}</p>
                  </div>
                ))}
              </div>
            );

          case "live-link":
            return (
              <Link
                key={i}
                to={block.href}
                className="mb-6 flex items-center gap-3 bg-gradient-to-r from-lumicoria-purple to-lumicoria-blue text-white rounded-xl px-5 py-3.5 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold">{block.label}</p>
                  <p className="text-xs text-white/70">{block.description}</p>
                </div>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            );

          case "divider":
            return <hr key={i} className="my-8 border-gray-100" />;

          default:
            return null;
        }
      })}
    </div>
  );
};

export default DocsContentRenderer;
