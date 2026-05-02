import React from 'react';
import { Scale, CheckCircle2, AlertTriangle, FileCheck, Zap, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/Footer';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20">
            <Scale className="size-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">Terms of Service</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Please read these terms carefully before using the Smart Campus Operations Hub. By accessing the platform, you agree to these conditions.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="border-slate-200/60 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <CardContent className="p-8 space-y-6">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">
                  <UserCheck className="size-4" />
                  <span>User Agreement</span>
                </div>
                <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  By accessing or using the Smart Campus Operations Hub, you signify your agreement to these Terms of Service. If you do not agree to all of these Terms, do not use the platform.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">
                  <Zap className="size-4" />
                  <span>Usage Limits</span>
                </div>
                <h2 className="text-xl font-bold">2. Use of License</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Permission is granted to temporarily use the resources available on the platform for personal, non-commercial campus-related activities. This is the grant of a license, not a transfer of title.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">
                  <AlertTriangle className="size-4" />
                  <span>Prohibited Conduct</span>
                </div>
                <h2 className="text-xl font-bold">3. Prohibited Activities</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Users are prohibited from attempting to decompile or reverse engineer any software contained on the platform, removing any copyright or other proprietary notations, or transferring the materials to another person.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">
                  <CheckCircle2 className="size-4" />
                  <span>Account Responsibility</span>
                </div>
                <h2 className="text-xl font-bold">4. Account Security</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
              </section>
            </CardContent>
          </Card>

          <div className="text-center text-slate-500 dark:text-slate-400 text-sm italic">
            Last updated: May 1, 2026
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
