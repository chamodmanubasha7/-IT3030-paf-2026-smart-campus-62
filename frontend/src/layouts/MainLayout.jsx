import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

export function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Determine active nav item based on route or query param
  let activeNav = 'dashboard';
  if (location.pathname === '/resources' || location.pathname.startsWith('/resources/')) {
    activeNav = 'catalogue';
  } else if (location.pathname === '/bookings/my') {
    activeNav = 'bookings';
  } else if (location.pathname.startsWith('/tickets')) {
    activeNav = 'tickets';
  } else if (location.pathname === '/admin/analytics') {
    activeNav = 'analytics';
  } else if (location.pathname === '/admin/bookings') {
    activeNav = 'manage-bookings';
  } else if (location.pathname === '/dashboard') {
    activeNav = searchParams.get('section') || 'dashboard';
  }

  const handleNavigate = (key) => {
    if (key === 'dashboard') navigate('/dashboard?section=dashboard');
    else if (key === 'catalogue') navigate('/resources');
    else if (key === 'bookings') navigate('/bookings/my');
    else if (key === 'tickets') navigate(user?.role === 'USER' ? '/tickets/my' : '/tickets/manage');
    else if (key === 'resource-management') navigate('/dashboard?section=resource-management');
    else if (key === 'manage-bookings') navigate('/dashboard?section=manage-bookings');
    else if (key === 'analytics') navigate('/admin/analytics');
    else navigate(`/dashboard?section=${key}`);
  };
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar 
          role={user?.role || 'USER'} 
          activeNav={activeNav}
          onNavigate={handleNavigate}
        />
        
        <SidebarInset className="flex flex-col flex-1 min-h-screen">
          <Navbar />
          
          <main className="flex-1 w-full bg-slate-950/50">
            {children}
          </main>
          
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
