import React from 'react';
import { HelpCircle, MessageSquare, Phone, Mail, FileSearch, Book, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/Footer';

export default function SupportPage() {
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert("Support ticket submitted successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20">
            <HelpCircle className="size-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">Operations Support Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Need assistance with the platform? Our support team is here to help you navigate the Hub and resolve any operational issues.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-lg bg-white dark:bg-slate-900">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 flex-shrink-0">
                    <Mail className="size-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-bold">Email Support</p>
                    <p className="text-sm text-slate-500">support@smartcampus.lk</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 flex-shrink-0">
                    <Phone className="size-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-bold">Hotline</p>
                    <p className="text-sm text-slate-500">+94 11 234 5678</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 flex-shrink-0">
                    <MessageSquare className="size-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold">Live Chat</p>
                    <p className="text-sm text-slate-500">Available Mon-Fri, 9am - 5pm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardContent className="p-6">
                <FileSearch className="size-8 text-teal-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">Documentation</h3>
                <p className="text-sm text-slate-300 mb-4">Browse our comprehensive guides and FAQs for quick answers.</p>
                <Button variant="secondary" className="w-full font-bold">Visit Docs</Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Support Form */}
          <div className="lg:col-span-2">
            <Card className="border-slate-200/60 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none h-full">
              <CardHeader>
                <CardTitle>Submit a Ticket</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you within 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Resource Booking Issue" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea 
                      id="message"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Describe your problem in detail..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-teal-600 hover:bg-teal-700 font-bold" disabled={submitting}>
                    {submitting ? (
                      <><Loader2 className="mr-2 size-4 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="mr-2 size-4" /> Send Ticket</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
