import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationLink {
  label: string;
  href: string;
}

interface DocsPaginationProps {
  prev?: PaginationLink | null;
  next?: PaginationLink | null;
}

const DocsPagination: React.FC<DocsPaginationProps> = ({ prev, next }) => {
  if (!prev && !next) return null;

  return (
    <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-100">
      {prev ? (
        <Link
          to={prev.href}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-lumicoria-purple transition-colors group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">Previous</span>
            <span className="font-medium">{prev.label}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          to={next.href}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-lumicoria-purple transition-colors group text-right"
        >
          <div>
            <span className="text-[10px] text-gray-400 block">Next</span>
            <span className="font-medium">{next.label}</span>
          </div>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
};

export default DocsPagination;
