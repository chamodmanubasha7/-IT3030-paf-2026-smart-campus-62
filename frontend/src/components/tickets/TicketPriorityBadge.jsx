import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  ArrowDown, 
  ArrowRight, 
  ArrowUp, 
  AlertTriangle 
} from 'lucide-react';

const PRIORITY_CONFIG = {
  LOW: {
    label: 'Low',
    classes: 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30',
    icon: ArrowDown
  },
  MEDIUM: {
    label: 'Medium',
    classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
    icon: ArrowRight
  },
  HIGH: {
    label: 'High',
    classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30',
    icon: ArrowUp
  },
  URGENT: {
    label: 'Urgent',
    classes: 'bg-red-600 text-white border-red-700 animate-pulse dark:bg-red-700 dark:border-red-800 shadow-lg shadow-red-500/20',
    icon: AlertTriangle
  }
};

export default function TicketPriorityBadge({ priority, className }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.LOW;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'px-2.5 py-1 rounded-md font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-sm', 
        config.classes, 
        className
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
    </Badge>
  );
}
