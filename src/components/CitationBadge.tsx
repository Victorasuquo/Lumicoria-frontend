import React from "react";

export interface SourceInfo {
  type: string;
  title?: string;
  document_id?: string;
  page_number?: number;
  bbox?: [number, number, number, number];
  page_width?: number;
  page_height?: number;
  chunk_text?: string;
}

interface CitationBadgeProps {
  index: number;
  source: SourceInfo;
  onClick: (source: SourceInfo) => void;
}

const CitationBadge: React.FC<CitationBadgeProps> = ({
  index,
  source,
  onClick,
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(source);
      }}
      title={source.title || `Source ${index}`}
      className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1 mx-0.5 text-[10px] font-semibold rounded bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors cursor-pointer align-super leading-none"
    >
      {index}
    </button>
  );
};

export default CitationBadge;
