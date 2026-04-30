import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, BookOpen, Users, LayoutDashboard, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      {/* Navbar (simplified for home page) */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
              <img src="/smart%20campus%20logo.png" alt="Logo" className="w-full h-full rounded-[10px] object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight">Smart Campus</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="px-5 py-2.5 text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors rounded-full border border-white/5">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="px-5 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-full shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
              <Sparkles className="size-4" />
              <span>Welcome to the future of campus management</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Campus Experience
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              A unified platform to manage facilities, book resources, and connect with the community. Everything you need, right at your fingertips.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? "/dashboard" : "/login"} className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition-all hover:scale-105 shadow-[0_0_40px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2">
                <LayoutDashboard className="size-5" />
                <span>{user ? 'Go to Dashboard' : 'Access Platform'}</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link to="/resources" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2">
                <Building2 className="size-5" />
                <span>Browse Catalogue</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="container mx-auto px-6 mt-32 relative z-10">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Building2,
                title: "Facilities & Assets",
                desc: "Explore and request access to state-of-the-art campus facilities and equipment.",
                color: "text-blue-400",
                bg: "bg-blue-500/10"
              },
              {
                icon: BookOpen,
                title: "Smart Bookings",
                desc: "Seamlessly schedule study rooms, labs, and equipment with real-time availability.",
                color: "text-indigo-400",
                bg: "bg-indigo-500/10"
              },
              {
                icon: Users,
                title: "Community Access",
                desc: "Connect with peers, manage roles, and participate in campus-wide events.",
                color: "text-purple-400",
                bg: "bg-purple-500/10"
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors group">
                <div className={`size-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`size-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
