import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  XCircle 
} from 'lucide-react';

const STATUS_CONFIG = {
  OPEN: {
    label: 'Open',
    classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
    icon: FileText
  },
  IN_PROGRESS: {
    label: 'In Progress',
    classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
    icon: Clock
  },
  RESOLVED: {
    label: 'Resolved',
    classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
    icon: CheckCircle2
  },
  CLOSED: {
    label: 'Closed',
    classes: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30',
    icon: XCircle
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30',
    icon: AlertCircle
  }
};

export default function TicketStatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm', 
        config.classes, 
        className
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
    </Badge>
  );
}
