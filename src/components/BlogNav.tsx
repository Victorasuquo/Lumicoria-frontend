import { Link } from "react-router-dom";

export default function BlogNav() {
  return (
    <nav className="h-16 sticky top-0 z-50 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-10">
      <Link to="/blog" className="flex items-center gap-2 text-xl font-light tracking-tight text-black">
        <img
          src="/images/lumicoria-logo-mono.png"
          alt="Lumicoria"
          className="w-7 h-7"
        />
        <span>
          <span className="italic">Lumi</span>
          <span className="font-normal">coria</span>
          <span className="font-normal">.ai</span>
        </span>
      </Link>

      <Link
        to="/signup"
        className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
      >
        Try Lumicoria.ai
      </Link>
    </nav>
  );
}
