import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, 
  ListFilter, 
  Plus, 
  LayoutGrid, 
  List, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Search,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TicketFilters from '@/components/tickets/TicketFilters';
import TicketTable from '@/components/tickets/TicketTable';
import TicketCard from '@/components/tickets/TicketCard';
import { filterTicketsLocal } from '@/lib/ticketFilters';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { ticketsApi } from '@/services/ticketsApi';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); 

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ticketsApi.listMyTickets({ page: 0, size: 100 });
      setRaw(res.data?.content ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load tickets'));
      setRaw([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => filterTicketsLocal(raw, { search, status, priority, category }),
    [raw, search, status, priority, category]
  );

  const stats = useMemo(() => {
    return {
      total: raw.length,
      active: raw.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length,
      resolved: raw.filter(t => t.status === 'RESOLVED').length,
      urgent: raw.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').length,
    };
  }, [raw]);

  return (
    <div className="min-h-screen pb-20 space-y-10">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-60 rounded-full bg-accent/20 blur-[80px]" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-black uppercase tracking-widest text-primary-foreground/80">
              <TrendingUp className="size-3.5" />
              Ticket Resolution Hub
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tight leading-none">
                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.name?.split(' ')[0] || 'Member'}</span>
              </h1>
              <p className="text-slate-400 font-medium text-lg max-w-xl">
                {user?.role === 'ADMIN' 
                  ? "Monitor all system-wide requests and ensure campus operations run smoothly."
                  : "Track your support requests, report issues, and stay updated on resolutions."}
              </p>
            </div>
          </div>
          
          <Button 
            size="lg"
            className="h-16 px-8 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-lg shadow-xl shadow-white/10 transition-all active:scale-95 group"
            onClick={() => navigate('/tickets/new')}
          >
            <Plus className="mr-2 size-6 group-hover:rotate-90 transition-transform duration-300" />
            New Request
          </Button>
        </div>
      </div>

      {/* Modern Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Tickets', value: stats.total, icon: Ticket, gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
          { label: 'In Progress', value: stats.active, icon: Clock, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/20' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, gradient: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-500/20' },
          { label: 'Critical', value: stats.urgent, icon: AlertCircle, gradient: 'from-rose-500 to-red-700', shadow: 'shadow-rose-500/20' },
        ].map((stat, i) => (
          <Card key={i} className={cn("group border-none bg-white dark:bg-slate-900 shadow-xl transition-all hover:scale-[1.02]", stat.shadow)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                  <stat.icon className="size-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                  <h4 className="text-3xl font-black tracking-tighter">{stat.value}</h4>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refined Filter & Action Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6 bg-slate-100/50 dark:bg-slate-800/30 p-4 rounded-[2rem] border border-border/50 backdrop-blur-sm">
        <div className="flex-1">
          <TicketFilters
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            priority={priority}
            onPriorityChange={setPriority}
            category={category}
            onCategoryChange={setCategory}
            idPrefix="my"
          />
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-slate-950 p-1.5 rounded-2xl border border-border shadow-sm">
          <button 
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all",
              viewMode === 'grid' ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20" : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="size-4" />
            GRID
          </button>
          <button 
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all",
              viewMode === 'list' ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20" : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="size-4" />
            LIST
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        {error && (
          <div className="mb-8 p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-rose-600 dark:text-rose-400">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg">
                <AlertCircle className="size-6" />
              </div>
              <div>
                <p className="font-black text-lg">System Synchronicity Error</p>
                <p className="text-sm font-medium opacity-80">{error}</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl border-rose-500/30 hover:bg-rose-500 hover:text-white" onClick={() => load()}>
              Force Refresh
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="relative">
              <div className="size-20 border-8 border-primary/10 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="size-8 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-sm font-black text-muted-foreground animate-pulse tracking-widest uppercase">Fetching Secure Data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-border/50 transition-all hover:border-primary/30">
            <div className="size-32 rounded-[2.5rem] bg-white dark:bg-slate-800 flex items-center justify-center mb-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <Ticket className="size-16 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-3xl font-black mb-3 tracking-tighter">No Records Found</h3>
            <p className="text-muted-foreground text-lg max-w-md text-center leading-relaxed font-medium">
              {raw.length === 0 
                ? "Your activity log is empty. Any support requests you create will appear here for tracking." 
                : "We couldn't locate any tickets matching your active filters. Try refining your search parameters."}
            </p>
            {raw.length === 0 && (
               <Button 
                variant="link" 
                className="mt-6 text-primary font-black text-lg"
                onClick={() => navigate('/tickets/new')}
              >
                Create your first ticket
              </Button>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filtered.map(t => (
                  <TicketCard key={t.id} ticket={t} onClick={(ticket) => navigate(`/tickets/${ticket.id}`)} />
                ))}
              </div>
            ) : (
              <div className="shadow-2xl rounded-[2rem] overflow-hidden border-none">
                <TicketTable
                  tickets={filtered}
                  onRowClick={(t) => navigate(`/tickets/${t.id}`)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
