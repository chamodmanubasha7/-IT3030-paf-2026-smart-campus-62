"use client";

import { useState } from 'react';
import { SearchForm } from '@/components/search-form';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LifeBuoy,
  MailPlus,
  LogOut,
  Settings,
  ShieldCheck,
  ShieldUser,
  Users,
  Wrench,
  UserCircle,
  HelpCircle,
  Command
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PLATFORM_NAV = [
  { key: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { key: 'catalogue', label: 'Resource Catalogue', icon: Building2 },
  { key: 'bookings', label: 'My Bookings', icon: BookOpen },
];

const ADMIN_NAV = [
  { key: 'resource-management', label: 'Assets & Infrastructure', icon: Building2 },
  { key: 'manage-bookings', label: 'Booking Approvals', icon: ShieldCheck },
  { key: 'analytics', label: 'Intelligence Reports', icon: BarChart3 },
];

const SECURITY_NAV = [
  { key: 'user-management', label: 'Identity Directory', icon: Users },
  { key: 'admin-management', label: 'Administrative Hub', icon: ShieldCheck },
  { key: 'super-admin-management', label: 'Authority Root', icon: ShieldUser },
  { key: 'admin-invites', label: 'Secure Invitations', icon: MailPlus },
];

export function AppSidebar({
  role = 'USER',
  activeNav = 'dashboard',
  onNavigate,
  onLogout,
  onSettings,
  ...props
}) {
  const { user, logout } = useAuth();
  const [isAccessOpen, setIsAccessOpen] = useState(true);
  const isAdminLike = role === 'ADMIN' || role === 'SUPER_ADMIN';
  
  const handleNav = (key) => {
    onNavigate?.(key);
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    else {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-800 bg-slate-950 font-sans" {...props}>
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-slate-900 transition-colors rounded-xl" onClick={() => handleNav('dashboard')}>
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
                <Command className="size-6" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-black text-white tracking-tight">Smart Campus Operations Hub</span>
                <span className="truncate text-[10px] font-black uppercase tracking-widest text-teal-500">Operations Hub</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-4 px-2">
           <SearchForm 
             className="bg-slate-900/50 border-slate-800 rounded-xl"
             placeholder="Search portal..." 
           />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Workspace</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {PLATFORM_NAV.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  isActive={activeNav === item.key}
                  tooltip={item.label}
                  onClick={() => handleNav(item.key)}
                  className={`h-11 rounded-xl transition-all ${
                    activeNav === item.key 
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/10' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <item.icon className="size-4" />
                  <span className="text-sm font-bold tracking-tight ml-2">{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeNav === 'tickets'}
                tooltip="Support Tickets"
                onClick={() => handleNav('tickets')}
                className={`h-11 rounded-xl transition-all ${
                  activeNav === 'tickets' 
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/10' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <LifeBuoy className="size-4" />
                <span className="text-sm font-bold tracking-tight ml-2">Operations Center</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {isAdminLike && (
          <SidebarGroup>
            <SidebarSeparator className="my-2 bg-slate-900" />
            <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Management</SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              {ADMIN_NAV.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={activeNav === item.key}
                    tooltip={item.label}
                    onClick={() => handleNav(item.key)}
                    className={`h-11 rounded-xl transition-all ${
                      activeNav === item.key 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <item.icon className="size-4" />
                    <span className="text-sm font-bold tracking-tight ml-2">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {role === 'SUPER_ADMIN' && (
          <SidebarGroup>
            <SidebarSeparator className="my-2 bg-slate-900" />
            <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Authority Control</SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <Collapsible open={isAccessOpen} onOpenChange={setIsAccessOpen} className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className="h-11 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                      tooltip="Access Protocols"
                    >
                      <ShieldUser className="size-4" />
                      <span className="text-sm font-bold tracking-tight ml-2">Identity Governance</span>
                      {isAccessOpen ? <ChevronDown className="ml-auto size-3.5" /> : <ChevronRight className="ml-auto size-3.5" />}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-l-2 border-slate-900 ml-4 pl-4 gap-1 mt-1">
                      {SECURITY_NAV.map((item) => (
                        <SidebarMenuSubItem key={item.key}>
                          <SidebarMenuSubButton
                            isActive={activeNav === item.key}
                            onClick={() => handleNav(item.key)}
                            className={`h-9 rounded-lg transition-all ${
                              activeNav === item.key 
                                ? 'text-indigo-400 font-black' 
                                : 'text-slate-500 hover:text-white'
                            }`}
                          >
                            <item.icon className="size-3.5 mr-2" />
                            <span className="text-xs font-bold tracking-tight">{item.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-900 bg-slate-950/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="w-full rounded-xl hover:bg-slate-900 transition-all p-2 group"
              onClick={() => handleNav('settings')}
            >
              <Avatar className="size-9 border-2 border-slate-800 group-hover:border-teal-500 transition-colors">
                <AvatarImage src={user?.profileImageUrl} alt={user?.name} />
                <AvatarFallback className="bg-teal-500/10 text-teal-500 font-black text-xs">
                  {(user?.name || 'U').slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight ml-3">
                <span className="truncate font-bold text-white">{user?.name || 'Authorized User'}</span>
                <span className="truncate text-[10px] font-black uppercase tracking-widest text-slate-500">{role}</span>
              </div>
              <Settings className="size-4 text-slate-500 group-hover:rotate-90 transition-transform duration-500" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-2">
            <SidebarMenuButton 
              className="w-full h-10 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span className="text-xs font-black uppercase tracking-widest ml-2">Terminate Session</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
