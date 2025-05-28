import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainNavItems = [
    { name: 'Agent Universe', href: '/agents' },
    { name: 'Live Studio', href: '/live-studio' },
    { name: 'Agent Builder', href: '/agent-builder' },
    { name: 'Well-being', href: '/wellbeing' },
    { name: 'Pricing', href: '/pricing' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-lumicoria-purple">Lumicoria.ai</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-lumicoria-purple transition-colors duration-300"
                >
                  {item.name}
                </Link>
              ))}
              <Button variant="outline" className="text-lumicoria-purple border-lumicoria-purple hover:bg-lumicoria-purple/10 transition-colors">
                <Link to="/login">Log in</Link>
              </Button>
              <Button className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white transition-colors">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-lumicoria-purple focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-lumicoria-purple hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 flex flex-col space-y-2">
              <Button variant="outline" className="text-lumicoria-purple border-lumicoria-purple hover:bg-lumicoria-purple/10 transition-colors">
                <Link to="/login">Log in</Link>
              </Button>
              <Button className="bg-lumicoria-purple hover:bg-lumicoria-deepPurple text-white transition-colors">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
