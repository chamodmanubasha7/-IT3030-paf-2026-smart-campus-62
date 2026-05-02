import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        navigate('/dashboard?section=settings');
    };

    // Don't show SidebarTrigger on HomePage since it doesn't have a sidebar
    const isHomePage = location.pathname === '/';

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 dark:bg-slate-950/80 px-4 md:px-8 backdrop-blur-md text-foreground dark:text-slate-50 shadow-sm transition-colors duration-300">
            <div className="flex items-center gap-4">
                {!isHomePage && <SidebarTrigger className="text-muted-foreground hover:text-foreground dark:text-slate-300 dark:hover:text-white" />}
                
                <Link to="/" className="flex items-center gap-3 text-foreground dark:text-white no-underline hover:opacity-90 transition-opacity">
                    <img
                        src="/hub_logo_new_1777603517713.png"
                        alt="Smart Campus Operations Hub"
                        className="size-8 rounded-lg object-cover"
                    />
                    <span className="font-bold text-lg hidden sm:inline-block tracking-tight">Smart Campus Operations Hub</span>
                </Link>
            </div>

            <div className="flex items-center gap-3">
                {user && <NotificationBell />}
                
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="outline-none focus:outline-none ml-2">
                                <Avatar className="h-9 w-9 border-2 border-indigo-500/50 hover:border-indigo-400 transition-all hover:scale-105 cursor-pointer">
                                    <AvatarImage src={user?.profileImageUrl} alt={user?.name || 'User'} />
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                        {(user?.name || 'U').slice(0, 1).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-1 border-border bg-popover text-popover-foreground dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-foreground dark:text-slate-100">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground dark:text-slate-400">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem onClick={handleProfile} className="cursor-pointer focus:bg-accent focus:text-accent-foreground dark:focus:bg-slate-800 dark:focus:text-slate-100">
                                <User className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-800" />
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-rose-600 dark:text-red-400 focus:text-rose-700 dark:focus:text-red-300 focus:bg-rose-50 dark:focus:bg-red-950/30">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link to="/login" className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                        Log In
                    </Link>
                )}
            </div>
        </header>
    );
};
