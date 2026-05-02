import React from 'react';
import { Shield, Lock, Eye, FileText, Globe, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-teal-500/10 rounded-2xl mb-4 border border-teal-500/20">
            <Shield className="size-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Your privacy is paramount. This policy outlines how we collect, use, and protect your data within the Smart Campus Operations Hub.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="border-slate-200/60 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <CardContent className="p-8 space-y-6">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs tracking-widest">
                  <Eye className="size-4" />
                  <span>Data Collection</span>
                </div>
                <h2 className="text-xl font-bold">What Information We Collect</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  We collect personal information that you provide to us such as name, email address, contact information, and academic details when you register on the platform. We also automatically collect certain information when you visit, use or navigate the platform.
                </p>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs tracking-widest">
                  <Lock className="size-4" />
                  <span>Data Usage</span>
                </div>
                <h2 className="text-xl font-bold">How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                  <li>To facilitate account creation and logon process.</li>
                  <li>To send you administrative information.</li>
                  <li>To manage user accounts and provide customer support.</li>
                  <li>To improve the efficiency of campus resource allocation.</li>
                </ul>
              </section>

              <hr className="border-slate-100 dark:border-slate-800" />

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold uppercase text-xs tracking-widest">
                  <Globe className="size-4" />
                  <span>Data Security</span>
                </div>
                <h2 className="text-xl font-bold">How We Keep Your Information Safe</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
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
