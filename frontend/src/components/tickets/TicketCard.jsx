import { Calendar, User, MessageSquare, ChevronRight, Activity, Clock } from 'lucide-react';
import TicketStatusBadge from './TicketStatusBadge';
import TicketPriorityBadge from './TicketPriorityBadge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function TicketCard({ ticket, onClick }) {
  const getPriorityColor = (p) => {
    switch (p) {
      case 'HIGH': return 'border-l-rose-500';
      case 'MEDIUM': return 'border-l-amber-500';
      case 'LOW': return 'border-l-blue-500';
      case 'URGENT': return 'border-l-red-600';
      default: return 'border-l-slate-300';
    }
  };

  const getStatusProgress = (s) => {
    switch (s) {
      case 'OPEN': return 'w-1/4 bg-blue-500';
      case 'IN_PROGRESS': return 'w-2/4 bg-amber-500';
      case 'RESOLVED': return 'w-full bg-emerald-500';
      case 'CLOSED': return 'w-full bg-slate-500';
      case 'REJECTED': return 'w-full bg-red-500';
      default: return 'w-0';
    }
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer bg-white dark:bg-slate-900 border-l-4 shadow-md",
        getPriorityColor(ticket.priority)
      )}
      onClick={() => onClick?.(ticket)}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Activity className="size-12 rotate-12" />
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary/80">
              <span className="bg-primary/10 px-2 py-0.5 rounded-md">#{ticket.id?.slice(-6) || 'N/A'}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{ticket.category}</span>
            </div>
            <h3 className="text-lg font-extrabold leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {ticket.title}
            </h3>
          </div>
          <TicketPriorityBadge priority={ticket.priority} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
            <div className="size-7 rounded-full bg-background flex items-center justify-center shadow-sm">
              <User className="size-3.5 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground leading-none mb-0.5">Assignee</span>
              <span className="text-xs font-bold truncate max-w-[80px]">
                {ticket.assignedTechnicianName || 'Unassigned'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
            <div className="size-7 rounded-full bg-background flex items-center justify-center shadow-sm">
              <Calendar className="size-3.5 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground leading-none mb-0.5">Updated</span>
              <span className="text-xs font-bold">
                {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
              <Clock className="size-3.5" />
              <span>Status</span>
            </div>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner">
            <div className={cn("h-full transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)", getStatusProgress(ticket.status))} />
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
               <MessageSquare className="size-4" />
               <span>{ticket.commentCount || 0}</span>
             </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-black text-primary transition-all group-hover:gap-3">
            EXPLORE
            <ChevronRight className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
