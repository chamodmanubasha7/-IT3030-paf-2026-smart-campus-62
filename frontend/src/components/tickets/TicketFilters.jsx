import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Tag, Activity, ShieldAlert } from 'lucide-react';
import { TICKET_CATEGORY, TICKET_PRIORITY, TICKET_STATUS } from '@/services/ticketsApi';

export default function TicketFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  showCategory = true,
  idPrefix = 'tf',
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-search`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Search className="size-3" />
          Filter by Title
        </Label>
        <Input
          id={`${idPrefix}-search`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="e.g. Broken AC in Lab 1"
          className="h-11 bg-background shadow-sm border-border/50 focus:ring-primary"
        />
      </div>
      
      {showCategory && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-cat`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Tag className="size-3" />
            Support Category
          </Label>
          <select
            id={`${idPrefix}-cat`}
            className="flex h-11 w-full rounded-md border border-border/50 bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {TICKET_CATEGORY.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-st`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Activity className="size-3" />
          Ticket Status
        </Label>
        <select
          id={`${idPrefix}-st`}
          className="flex h-11 w-full rounded-md border border-border/50 bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {TICKET_STATUS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-pr`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ShieldAlert className="size-3" />
          Priority Level
        </Label>
        <select
          id={`${idPrefix}-pr`}
          className="flex h-11 w-full rounded-md border border-border/50 bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          {TICKET_PRIORITY.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
