import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-slate-950 text-slate-400 py-6 mt-auto">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px]">
            <img src="/smart%20campus%20logo.png" alt="Logo" className="w-full h-full rounded-[3px] object-cover" />
          </div>
          <span className="text-sm font-semibold text-slate-200">Smart Campus</span>
        </div>
        
        <div className="text-sm">
          &copy; {new Date().getFullYear()} Smart Campus Operations Hub. All rights reserved.
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
