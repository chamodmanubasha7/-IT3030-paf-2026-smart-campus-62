import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Building2, 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Globe, 
  CheckCircle2,
  Lock,
  PieChart,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-teal-500/30 font-sans">
      {/* Floating Smart Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-2xl shadow-2xl transition-all">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 p-0.5 shadow-lg shadow-teal-500/20">
              <img src="/hub_logo_new_1777603517713.png" alt="Logo" className="w-full h-full rounded-[10px] object-cover" />
            </div>
            <span className="font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Smart Campus <span className="text-teal-400">Operations Hub</span>
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
             <Link to="/resources" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Asset Catalogue</Link>
             <Link to="/support" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Support & About</Link>
             <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Operational Portal</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild variant="outline" className="rounded-xl border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 text-teal-400 font-bold h-10 border">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-black text-slate-400 hover:text-white transition-colors px-2">Sign In</Link>
                <Button asChild className="rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black h-10 px-6 shadow-xl shadow-teal-500/20 transition-all active:scale-95">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative overflow-hidden">
        {/* Atmosphere & Gradients */}
        <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-teal-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
        </div>

        {/* Hero Section - Focused & High Impact */}
        <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-32">
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                  <Sparkles className="size-3.5 fill-teal-500/50" />
                  <span>SLIIT Intelligent Infrastructure</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-white">
                  The Future of <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-indigo-400 to-purple-400">
                    Operations
                  </span>
                </h1>
                
                <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  A unified operations hub designed to streamline facility management, optimize resource scheduling, and empower the SLIIT community through automated intelligence.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button asChild size="lg" className="h-14 px-10 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black text-md transition-all hover:scale-[1.02] shadow-2xl shadow-white/5 group">
                    <Link to={user ? "/dashboard" : "/login"} className="flex items-center gap-3">
                      <span>Launch Portal</span>
                      <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-black text-md backdrop-blur-md transition-all">
                    <Link to="/resources" className="flex items-center gap-3">
                      <Layers className="size-5" />
                      <span>Explore Assets</span>
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-black text-white">99.9%</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Service Uptime</div>
                  </div>
                  <div className="text-center lg:text-left border-l border-white/10 pl-8">
                    <div className="text-2xl font-black text-white">50ms</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Latency Core</div>
                  </div>
                </div>
              </div>

              {/* Optimized SLIIT Platform Visualization */}
              <div className="flex-1 relative w-full group max-w-2xl mx-auto">
                <div className="absolute inset-0 bg-teal-500/20 rounded-[2.5rem] blur-3xl group-hover:bg-teal-500/30 transition-all duration-700" />
                <div className="relative rounded-[2.5rem] border border-white/10 bg-slate-900/50 backdrop-blur-sm p-2 overflow-hidden shadow-2xl transition-all duration-700 hover:translate-y-[-8px]">
                  <img 
                    src="/smart_sliit_campus_visualization_1777615823246.png" 
                    alt="Smart Campus Operations Hub Visualization" 
                    className="w-full h-auto rounded-[2rem] object-cover scale-[1.02] group-hover:scale-100 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 right-6 p-4 rounded-2xl border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                        <GraduationCap className="size-5 text-white" />
                      </div>
                      <div className="font-black text-xs">Node 01 Operational</div>
                    </div>
                    <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Condensed Feature Matrix */}
        <section className="py-24 relative bg-slate-900/40 backdrop-blur-3xl border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: BookOpen, title: "Smart Scheduling", desc: "Predictive booking for labs and halls.", color: "text-teal-400", bg: "bg-teal-400/10" },
                { icon: ShieldCheck, title: "Verified Access", desc: "Automated role-based security.", color: "text-indigo-400", bg: "bg-indigo-400/10" },
                { icon: Zap, title: "Instant Support", desc: "AI-driven maintenance ticketing.", color: "text-purple-400", bg: "bg-purple-400/10" },
                { icon: Globe, title: "Campus Telemetry", desc: "Live utilization and usage heatmaps.", color: "text-rose-400", bg: "bg-rose-400/10" }
              ].map((item, i) => (
                <Card key={i} className="border-none bg-white/5 hover:bg-white/[0.08] transition-all rounded-3xl group overflow-hidden">
                  <CardContent className="p-8 space-y-4">
                    <div className={cn("size-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", item.bg)}>
                      <item.icon className={cn("size-6", item.color)} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg tracking-tight mb-2">{item.title}</h3>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Professional Summary Section - Shorter & Clearer */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6 text-center max-w-4xl space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter">Engineered for Excellence</h2>
              <p className="text-slate-400 font-medium text-lg">
                The Smart Campus Operations Hub is more than just a booking tool. It's a comprehensive operating system for modern academic environments, ensuring every resource is utilized to its full potential.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {[
                 { val: "24/7", label: "Autonomous Ops" },
                 { val: "100%", label: "Digital Workflow" },
                 { val: "< 1s", label: "Sync Latency" },
                 { val: "Encrypted", label: "Data Integrity" }
               ].map((stat, i) => (
                 <div key={i} className="space-y-1">
                    <div className="text-2xl font-black text-teal-400 tracking-tighter">{stat.val}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">{stat.label}</div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Final Integrated CTA */}
        <section className="pb-32 pt-12 relative">
           <div className="container mx-auto px-6 text-center">
              <div className="relative rounded-[3rem] bg-gradient-to-br from-teal-600 to-indigo-700 overflow-hidden px-8 py-20 shadow-2xl">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                 <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none text-white">Join the Operational Hub</h2>
                    <p className="text-teal-100 font-medium text-lg opacity-80">
                      Step into a more efficient, automated, and connected campus life today.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                       <Button asChild size="lg" className="h-14 px-12 rounded-xl bg-white text-teal-600 hover:bg-slate-100 font-black text-lg transition-all active:scale-95 shadow-xl">
                          <Link to="/register">Create Account</Link>
                       </Button>
                       <Button asChild variant="outline" size="lg" className="h-14 px-12 rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-black text-lg backdrop-blur-md transition-all active:scale-95">
                          <Link to="/login">Sign In</Link>
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
