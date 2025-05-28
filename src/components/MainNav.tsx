import React from 'react';
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
  LogOut
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

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = user?.full_name ? getInitials(user.full_name) : 'U';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutGrid className="h-5 w-5" /> },
    { label: 'Documents', path: '/documents', icon: <FileText className="h-5 w-5" /> },
    { label: 'Agents', path: '/agents', icon: <User className="h-5 w-5" /> },
    { label: 'Well-being', path: '/wellbeing', icon: <Heart className="h-5 w-5" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> }
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
    <header className="fixed top-0 left-0 right-0 border-b bg-white/80 backdrop-blur-md z-40">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <svg
              className="h-8 w-8 text-purple-600" 
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="ml-2 text-xl font-bold text-purple-600">Lumicoria.ai</span>
          </Link>

          {isAuthenticated && (
            <nav className="flex items-center ml-8 space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-purple-600",
                    location.pathname === item.path
                      ? "text-purple-600 border-b-2 border-purple-600 pb-4 -mb-4"
                      : "text-gray-700"
                  )}
                >
                  <span className="hidden md:block">{item.label}</span>
                  <span className="block md:hidden">{item.icon}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
              <Button variant="ghost" size="icon">
                <Camera className="h-5 w-5" />
              </Button>
              <div className="border-l h-6 mx-2 border-gray-200" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar_url || ''} />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MainNav;
