import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Ticket as TicketIcon, ListChecks, TrendingUp, AlertCircle, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TicketFilters from '@/components/tickets/TicketFilters';
import TicketTable from '@/components/tickets/TicketTable';
import { filterTicketsLocal } from '@/lib/ticketFilters';
import { ticketsApi } from '@/services/ticketsApi';
import { cn } from '@/lib/utils';

const STATUS_ORDER = {
  OPEN: 0,
  IN_PROGRESS: 1,
  RESOLVED: 2,
  CLOSED: 3,
  REJECTED: 4,
};

function sortQueueTickets(tickets) {
  return [...tickets].sort((a, b) => {
    const aOrder = STATUS_ORDER[a.status] ?? 99;
    const bOrder = STATUS_ORDER[b.status] ?? 99;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bUpdated - aUpdated;
  });
}

export default function TicketManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? 'USER';

  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [category, setCategory] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ticketsApi.listTickets({ page: 0, size: 100 });
      const content = res.data?.content ?? [];
      setRaw(content);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tickets');
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => sortQueueTickets(filterTicketsLocal(raw, { search, status, priority, category })),
    [raw, search, status, priority, category]
  );

  const stats = useMemo(() => {
    return {
      total: raw.length,
      unassigned: raw.filter(t => !t.assignedTechnicianId).length,
      critical: raw.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length,
      pending: raw.filter(t => t.status === 'OPEN').length,
    };
  }, [raw]);

  return (
    <div className="min-h-screen pb-20 space-y-10">
      {/* Premium Management Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-60 rounded-full bg-indigo-500/20 blur-[80px]" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-blue-400">
              <ListChecks className="size-3" />
              Administrative Control
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-none">
              Ticket <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Operations</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm">
              {role === 'TECHNICIAN' 
                ? "Manage your assigned tasks and update resolution progress." 
                : "Full visibility over campus-wide requests and technical staff allocation."}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
              onClick={() => load()}
              disabled={loading}
            >
              <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />
              Sync Queue
            </Button>
            <Button 
              className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-95" 
              onClick={() => navigate('/tickets/new')}
            >
              <Plus className="mr-2 size-5" />
              Log Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: stats.total, icon: TicketIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Unassigned', value: stats.unassigned, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Critical Alert', value: stats.critical, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Fresh Requests', value: stats.pending, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none bg-white dark:bg-slate-900 shadow-xl overflow-hidden group">
            <CardContent className="p-6 flex items-center justify-between relative">
              <div className={cn("absolute -right-4 -bottom-4 size-20 opacity-5 transition-transform group-hover:scale-125", stat.color)}>
                <stat.icon className="size-full" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                <h4 className="text-3xl font-black tracking-tight">{stat.value}</h4>
              </div>
              <div className={cn("p-3 rounded-2xl relative z-10", stat.bg)}>
                <stat.icon className={cn("size-6", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Master Queue Table */}
      <div className="space-y-6">
        <div className="bg-slate-100/50 dark:bg-slate-800/30 p-4 rounded-[2.5rem] border border-border/50 backdrop-blur-sm">
          <TicketFilters
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            priority={priority}
            onPriorityChange={setPriority}
            category={category}
            onCategoryChange={setCategory}
            idPrefix="mgmt"
          />
        </div>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
          <CardContent className="p-0">
            {error ? (
              <div className="p-12 text-center space-y-4">
                <div className="mx-auto size-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <AlertCircle className="size-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black">Sync Failure</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">{error}</p>
                </div>
                <Button variant="outline" className="rounded-xl" onClick={() => load()}>Retry Connection</Button>
              </div>
            ) : loading ? (
              <div className="py-40 flex flex-col items-center justify-center space-y-4">
                <div className="size-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Accessing Secure Records...</p>
              </div>
            ) : (
              <TicketTable
                tickets={filtered}
                onRowClick={(t) => navigate(`/tickets/${t.id}`)}
                emptyMessage={
                  raw.length === 0
                    ? 'The management queue is currently empty.'
                    : 'No records match your administrative filter.'
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
