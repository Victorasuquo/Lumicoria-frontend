import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Settings,
  Camera,
  LayoutGrid,
  FileText,
  Heart,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const MainNav = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAuthenticated = !!user;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position for nav styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = user?.full_name ? getInitials(user.full_name) : 'U';

  const publicNavItems = [
    { label: 'Pricing', path: '/pricing' },
    { label: 'Agents', path: '/agents' },
    { label: 'Well-being', path: '/wellbeing' },
  ];

  const authNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
    { label: 'Documents', path: '/documents', icon: <FileText className="h-4 w-4" /> },
    { label: 'Agents', path: '/agents', icon: <User className="h-4 w-4" /> },
    { label: 'Well-being', path: '/wellbeing', icon: <Heart className="h-4 w-4" /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      {/* Floating Glass Pill Navigation */}
      <nav
        className={cn(
          "flex items-center justify-between px-3 py-3 rounded-full transition-all duration-500 ease-out",
          "backdrop-blur-md border border-gray-200/30 dark:border-white/10",
          "shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
          isScrolled
            ? "bg-white/90 dark:bg-gray-900/90 shadow-[0_4px_24px_rgba(0,0,0,0.12)]"
            : "bg-white/80 dark:bg-gray-900/80",
          isAuthenticated ? "w-full max-w-4xl" : "w-full max-w-2xl"
        )}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center px-4 py-2 group"
        >
          <span className="text-xl font-light tracking-tight text-gray-900 dark:text-white">
            <span className="font-light italic">Lumi</span>
            <span className="font-medium">coria</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {isAuthenticated ? (
            // Authenticated Navigation
            <>
              {authNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                    location.pathname === item.path
                      ? "bg-gray-900/10 dark:bg-white/10 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </>
          ) : (
            // Public Navigation
            <>
              {publicNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                    location.pathname === item.path
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full h-9 w-9 hover:bg-gray-100/50 dark:hover:bg-white/10"
              >
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-500"></span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 ring-2 ring-white/50">
                      <AvatarImage src={user?.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-white/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                  <DropdownMenuLabel className="px-4 py-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <DropdownMenuItem asChild className="px-4 py-2 rounded-lg mx-2 cursor-pointer">
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="px-4 py-2 rounded-lg mx-2 cursor-pointer">
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <DropdownMenuItem onClick={handleLogout} className="px-4 py-2 rounded-lg mx-2 mb-2 cursor-pointer text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link to="/signup">
              <Button
                className={cn(
                  "rounded-full px-6 py-2 text-sm font-medium transition-all duration-300",
                  "bg-gray-900 dark:bg-white text-white dark:text-gray-900",
                  "hover:bg-gray-800 dark:hover:bg-gray-100",
                  "shadow-lg hover:shadow-xl hover:scale-105"
                )}
              >
                Get started
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-2 rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 md:hidden">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-4 space-y-2">
            {(isAuthenticated ? authNavItems : publicNavItems).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                  location.pathname === item.path
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {'icon' in item && item.icon}
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-2xl text-sm font-medium bg-gray-900 text-white text-center"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default MainNav;
