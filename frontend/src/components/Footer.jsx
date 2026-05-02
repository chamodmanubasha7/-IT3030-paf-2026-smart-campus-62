import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Send, Share2, Users, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-16 pb-8 border-t border-slate-200 dark:border-slate-900 mt-auto transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Branding & Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-teal-500/10 dark:bg-teal-500/20 p-1.5 border border-teal-500/20 dark:border-teal-500/30">
                <img src="/hub_logo_new_1777603517713.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Smart Campus Operations Hub</span>
            </div>
            <p className="text-sm leading-relaxed">
              The ultimate operational ecosystem for modern universities. Streamlining administration, resource management, and campus security through integrated smart solutions.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-slate-200 dark:bg-slate-900 rounded-lg hover:text-white transition-all hover:bg-teal-600 group">
                <Globe className="size-4" />
              </a>
              <a href="#" className="p-2 bg-slate-200 dark:bg-slate-900 rounded-lg hover:text-white transition-all hover:bg-teal-600 group">
                <Send className="size-4" />
              </a>
              <a href="#" className="p-2 bg-slate-200 dark:bg-slate-900 rounded-lg hover:text-white transition-all hover:bg-teal-600 group">
                <Share2 className="size-4" />
              </a>
              <a href="#" className="p-2 bg-slate-200 dark:bg-slate-900 rounded-lg hover:text-white transition-all hover:bg-teal-600 group">
                <Users className="size-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase text-xs tracking-widest">Platform</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Home</Link></li>
              <li><Link to="/login" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 3: Support & Legal */}
          <div>
            <h3 className="text-slate-900 dark:text-white font-bold mb-6 uppercase text-xs tracking-widest">Support & Legal</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/support" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Help Center</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Terms of Service</Link></li>
              <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Security Profile</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h3 className="text-slate-900 dark:text-white font-bold uppercase text-xs tracking-widest">Stay Updated</h3>
            <p className="text-sm">Get the latest campus updates and operational news directly.</p>
            <div className="flex gap-2">
              <Input 
                placeholder="Email address" 
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-foreground dark:text-white text-xs h-10 focus:ring-teal-500"
              />
              <Button size="icon" className="bg-teal-600 hover:bg-teal-700 h-10 w-10 shrink-0">
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-900 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin className="size-3" />
              <span>SLIIT Malabe Campus</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-3" />
              <span>+94 11 234 5678</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Smart Campus Operations Hub. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
