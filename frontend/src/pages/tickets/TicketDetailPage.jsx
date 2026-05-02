import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, Info, User, CalendarClock, Paperclip, MessageSquare, 
  Download, Copy, Check, ShieldAlert, Clock, MapPin, Tag 
} from 'lucide-react';
import AssignmentPanel from '@/components/tickets/AssignmentPanel';
import AttachmentUploader from '@/components/tickets/AttachmentUploader';
import CommentSection from '@/components/tickets/CommentSection';
import TicketPriorityBadge from '@/components/tickets/TicketPriorityBadge';
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { ticketsApi } from '@/services/ticketsApi';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function formatContactMethod(method) {
  if (!method) return 'Not specified';
  return method.replace('_', ' ');
}

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role ?? 'USER';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const canStaffPanel = isAdmin || role === 'TECHNICIAN';
  const isUser = role === 'USER';

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError('Invalid ticket link');
      setTicket(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await ticketsApi.getTicket(id);
      setTicket(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load ticket'));
      setTicket(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const copyId = () => {
    if (!ticket?.id) return;
    navigator.clipboard.writeText(ticket.id.toString());
    setCopied(true);
    toast.success('Ticket ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = () => {
    if (!ticket) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(`Ticket Report: #${ticket.id}`, 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);
    
    // Ticket Summary Table
    const summaryData = [
      ['Title', ticket.title],
      ['Status', ticket.status],
      ['Priority', ticket.priority],
      ['Category', ticket.category],
      ['Location', ticket.locationOrResource || 'N/A'],
      ['Created By', ticket.createdByName],
      ['Created At', new Date(ticket.createdAt).toLocaleString()],
      ['Assigned To', ticket.assignedTechnicianName || 'Unassigned'],
    ];
    
    doc.autoTable({
      startY: 40,
      head: [['Field', 'Details']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });
    
    // Description
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Description', 14, finalY);
    
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const splitDesc = doc.splitTextToSize(ticket.description, 180);
    doc.text(splitDesc, 14, finalY + 7);
    
    // Resolution if any
    if (ticket.resolutionNotes) {
      const resY = finalY + 15 + (splitDesc.length * 5);
      doc.setFontSize(14);
      doc.text('Resolution Notes', 14, resY);
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(ticket.resolutionNotes, 180), 14, resY + 7);
    }
    
    doc.save(`Ticket_${ticket.id}_Report.pdf`);
    toast.success('PDF Downloaded');
  };

  const attachments = ticket?.attachments ?? [];
  const canAddMore = attachments.length < 3;

  const canDeleteAttachment = (a) =>
    isAdmin ||
    (user?.id != null && a.uploadedById === user.id) ||
    (!!user?.name && a.uploadedByName?.trim() === user.name.trim());

  const handleUploadMore = async () => {
    if (!ticket || !uploadFiles.length) return;
    setUploadBusy(true);
    try {
      for (const file of uploadFiles) {
        await ticketsApi.addAttachment(ticket.id, file);
      }
      setUploadFiles([]);
      await load();
      toast.success('Attachment added');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Upload failed'));
    } finally {
      setUploadBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center space-y-4">
        <div className="size-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading secure record...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="mx-auto size-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
          <ShieldAlert className="size-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Access Denied</h2>
          <p className="text-muted-foreground font-medium">{error || 'The requested ticket could not be found or is restricted.'}</p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" className="rounded-xl h-12 px-8 font-bold" onClick={() => navigate(-1)}>Go Back</Button>
          <Button className="rounded-xl h-12 px-8 font-bold" onClick={() => load()}>Retry Connection</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-60 rounded-full bg-indigo-500/20 blur-[80px]" />
        
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-4 flex-1">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <ChevronLeft className="size-4" /> Back to Dashboard
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight leading-tight">
                  Ticket <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">#{ticket.id}</span>
                </h1>
                <button 
                  onClick={copyId}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90 group"
                  title="Copy Ticket ID"
                >
                  {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4 text-slate-400 group-hover:text-white" />}
                </button>
              </div>
              <h2 className="text-2xl font-bold text-slate-100">{ticket.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button 
              variant="outline"
              className="h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all shadow-xl"
              onClick={downloadPdf}
            >
              <Download className="mr-2 size-4" /> Export PDF
            </Button>
            {isUser && (
               <Button 
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95" 
                onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <MessageSquare className="mr-2 size-5" />
                Discussions
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-8 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-3 text-blue-500 mb-4">
                <Info className="size-6" />
                <h3 className="text-xl font-black tracking-tight">Issue Overview</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</p>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Tag className="size-4 text-blue-400" />
                    {ticket.category}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location / Resource</p>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <MapPin className="size-4 text-rose-400" />
                    {ticket.locationOrResource || 'General Campus'}
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</h4>
                <div className="text-base leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-border/30 whitespace-pre-wrap font-medium">
                  {ticket.description}
                </div>
              </div>

              {ticket.preferredContactMethod && (
                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Contact Preference</h4>
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest">
                      {formatContactMethod(ticket.preferredContactMethod)}
                    </div>
                    <p className="text-sm font-bold">{ticket.preferredContactDetails || 'No details provided'}</p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-border/50 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-blue-500">
                    {ticket.createdByName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reporter</p>
                    <p className="text-sm font-bold">{ticket.createdByName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reported On</p>
                    <p className="text-sm font-bold">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'}</p>
                  </div>
                </div>
              </div>

              {ticket.status === 'REJECTED' && ticket.rejectionReason && (
                <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <div className="flex items-center gap-2 mb-2 font-black text-xs uppercase tracking-widest">
                    <ShieldAlert className="size-4" /> Rejection Reason
                  </div>
                  <p className="text-sm font-medium">{ticket.rejectionReason}</p>
                </div>
              )}

              {ticket.resolutionNotes && (
                <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <div className="flex items-center gap-2 mb-2 font-black text-xs uppercase tracking-widest">
                    <Check className="size-4" /> Resolution Intelligence
                  </div>
                  <p className="text-sm font-medium">{ticket.resolutionNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
             <div className="p-8 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-indigo-500">
                  <Paperclip className="size-6" />
                  <h3 className="text-xl font-black tracking-tight">Attachments</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {attachments.length} / 3 Uploaded
                </span>
             </div>
             <CardContent className="p-8 space-y-6">
                {attachments.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <Paperclip className="mx-auto size-10 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm text-muted-foreground font-medium">No visual evidence attached to this ticket.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {attachments.map((a) => (
                      <div key={a.id} className="group relative rounded-3xl border border-border/50 bg-slate-50 dark:bg-slate-950 p-3 transition-all hover:shadow-xl hover:border-blue-500/30">
                        <div className="flex items-center gap-4">
                          {isHttpUrl(a.filePath) ? (
                            <a href={a.filePath} target="_blank" rel="noreferrer" className="shrink-0 overflow-hidden rounded-2xl shadow-lg ring-2 ring-white/50 dark:ring-black/50">
                               <img src={a.filePath} alt={a.fileName} className="size-16 object-cover transition-transform group-hover:scale-110" />
                            </a>
                          ) : (
                            <div className="size-16 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <ShieldAlert className="size-6" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-200">{a.fileName}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">By {a.uploadedByName || 'Reporter'}</p>
                            {isHttpUrl(a.filePath) && (
                              <a href={a.filePath} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-500 hover:underline uppercase tracking-widest mt-1 block">Full Screen</a>
                            )}
                          </div>
                          {canDeleteAttachment(a) && (
                            <button 
                              onClick={async () => {
                                if (!window.confirm('Purge this attachment?')) return;
                                try {
                                  await ticketsApi.deleteAttachment(ticket.id, a.id);
                                  await load();
                                  toast.success('Attachment purged');
                                } catch (err) {
                                  toast.error('Purge failed');
                                }
                              }}
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <ShieldAlert className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {canAddMore && (
                  <div className="pt-6 border-t border-border/50 space-y-4">
                    <AttachmentUploader isUser={isUser} files={uploadFiles} onChange={setUploadFiles} disabled={uploadBusy} idPrefix="det" />
                    <Button 
                      className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold transition-all shadow-xl shadow-indigo-500/20" 
                      onClick={handleUploadMore}
                      disabled={uploadBusy || uploadFiles.length === 0}
                    >
                      {uploadBusy ? 'Synchronizing Files...' : 'Inject Attachment'}
                    </Button>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Sidebar: Assignment & Comments */}
        <div className="space-y-8">
          {canStaffPanel && (
            <AssignmentPanel ticket={ticket} role={role} onUpdated={load} />
          )}
          
          <Card id="comments" className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 h-fit">
            <div className="p-8 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-3 text-emerald-500">
                <MessageSquare className="size-6" />
                <h3 className="text-xl font-black tracking-tight">Discussions</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <CommentSection
                comments={ticket.comments ?? []}
                currentUserId={user?.id}
                currentUserName={user?.name}
                isAdmin={isAdmin}
                disabled={false}
                isUser={isUser}
                onAdd={async (message) => {
                  try {
                    await ticketsApi.addComment(ticket.id, { message });
                    await load();
                    toast.success('Comment broadcasted');
                  } catch (err) {
                    toast.error('Broadcast failed');
                  }
                }}
                onUpdate={async (commentId, message) => {
                  try {
                    await ticketsApi.updateComment(ticket.id, commentId, { message });
                    await load();
                    toast.success('Comment refined');
                  } catch (err) {
                    toast.error('Refinement failed');
                  }
                }}
                onDelete={async (commentId) => {
                  try {
                    await ticketsApi.deleteComment(ticket.id, commentId);
                    await load();
                    toast.success('Comment retracted');
                  } catch (err) {
                    toast.error('Retraction failed');
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
