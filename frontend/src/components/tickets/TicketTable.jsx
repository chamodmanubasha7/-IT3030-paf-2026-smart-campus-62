import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import TicketPriorityBadge from '@/components/tickets/TicketPriorityBadge';
import TicketStatusBadge from '@/components/tickets/TicketStatusBadge';
import { ExternalLink, User as UserIcon, Calendar, Hash } from 'lucide-react';

export default function TicketTable({
  tickets,
  onRowClick,
  selectedId,
  emptyMessage = 'No tickets match your filters.',
}) {
  const { user } = useAuth();

  if (!tickets.length) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border/50 py-24 text-center bg-muted/5">
        <p className="text-lg font-black text-muted-foreground uppercase tracking-widest">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground/60 mt-2">Try adjusting your filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-border shadow-2xl bg-white dark:bg-slate-900">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-border bg-slate-50 dark:bg-slate-800/50">
            <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Hash className="size-3.5" />
                Ref
              </div>
            </th>
            <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Subject & Category</th>
            <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Assignee</th>
            <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Priority</th>
            <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
            <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5" />
                Updated
              </div>
            </th>
            <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tickets.map((t) => (
            <tr
              key={t.id}
              className={`group transition-all hover:bg-primary/[0.02] cursor-pointer ${selectedId != null && t.id === selectedId ? 'bg-primary/5' : ''}`}
              onClick={() => onRowClick?.(t)}
            >
              <td className="px-8 py-6">
                <span className="font-mono text-xs font-black bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 border border-border/50">
                  #{t.id?.slice(-8) || 'N/A'}
                </span>
              </td>
              <td className="px-8 py-6 max-w-[350px]">
                <div className="space-y-1.5">
                   <p className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors truncate">
                     {t.title}
                   </p>
                   <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest bg-muted w-fit px-2 py-0.5 rounded">
                     {t.category}
                   </p>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    <UserIcon className="size-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground/90">
                    {t.assignedTechnicianName || <span className="text-muted-foreground/40 italic">Unassigned</span>}
                  </span>
                </div>
              </td>
              <td className="px-8 py-6">
                <TicketPriorityBadge priority={t.priority} />
              </td>
              <td className="px-8 py-6">
                <TicketStatusBadge status={t.status} />
              </td>
              <td className="px-8 py-6 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {t.updatedAt ? new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </td>
              <td className="px-8 py-6 text-right">
                <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-border/60 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                  <ExternalLink className="size-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
