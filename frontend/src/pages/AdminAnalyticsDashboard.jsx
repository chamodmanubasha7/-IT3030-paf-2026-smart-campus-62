import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getAllBookings } from '../api/bookingApi';
import { getResources } from '../api/resourceApi';
import { 
  LayoutDashboard, TrendingUp, Users, Clock, Coffee, 
  FileText, AlertTriangle, Calendar, Filter, Activity,
  ChevronDown, ArrowUpRight, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];
const COUNTABLE_STATUSES = new Set(['PENDING', 'APPROVED']);

const formatDateLabel = (dateStr) => {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const AdminAnalyticsDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rangeDays, setRangeDays] = useState(7);
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [bookingsData, resourcesResponse] = await Promise.all([
                    getAllBookings(),
                    getResources({ page: 0, size: 500 }),
                ]);
                setBookings(bookingsData || []);
                setResources(resourcesResponse?.content || []);
            } catch (err) {
                toast.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const resourceMap = useMemo(() => {
        const map = new Map();
        resources.forEach((resource) => map.set(String(resource.id), resource));
        return map;
    }, [resources]);

    const filteredBookings = useMemo(() => {
        const fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        fromDate.setDate(fromDate.getDate() - (rangeDays - 1));
        const fromDateStr = fromDate.toISOString().slice(0, 10);

        return bookings.filter((booking) => {
            const matchesRange = booking.date >= fromDateStr;
            if (!matchesRange) return false;
            if (typeFilter === 'ALL') return true;
            const resource = resourceMap.get(String(booking.resourceId));
            return resource?.type === typeFilter;
        });
    }, [bookings, rangeDays, typeFilter, resourceMap]);

    const usageBookings = filteredBookings.filter((booking) => COUNTABLE_STATUSES.has(booking.status));
    const totalSeatsConsumed = usageBookings.reduce((sum, booking) => sum + Number(booking.attendees || 0), 0);

    const dailyTrend = useMemo(() => {
        const dateMap = new Map();
        filteredBookings.forEach((booking) => {
            const current = dateMap.get(booking.date) || { bookings: 0, seats: 0 };
            current.bookings += 1;
            if (COUNTABLE_STATUSES.has(booking.status)) {
                current.seats += Number(booking.attendees || 0);
            }
            dateMap.set(booking.date, current);
        });
        return [...dateMap.entries()]
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, value]) => ({
                date: formatDateLabel(date),
                bookings: value.bookings,
                seats: value.seats,
            }));
    }, [filteredBookings]);

    const hourlyUsage = useMemo(() => {
        const hourMap = new Map();
        usageBookings.forEach((booking) => {
            const hour = Number(String(booking.startTime || '00:00').split(':')[0]);
            const current = hourMap.get(hour) || 0;
            hourMap.set(hour, current + Number(booking.attendees || 0));
        });
        return [...hourMap.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([hour, seats]) => ({ hour: `${String(hour).padStart(2, '0')}:00`, seats }));
    }, [usageBookings]);

    const topResources = useMemo(() => {
        const resourceStats = new Map();
        usageBookings.forEach((booking) => {
            const key = String(booking.resourceId);
            const stats = resourceStats.get(key) || { bookings: 0, seats: 0, name: booking.resourceName };
            stats.bookings += 1;
            stats.seats += Number(booking.attendees || 0);
            resourceStats.set(key, stats);
        });
        return [...resourceStats.values()]
            .sort((a, b) => b.seats - a.seats)
            .slice(0, 7)
            .map((entry) => ({ name: entry.name, bookings: entry.bookings, seats: entry.seats }));
    }, [usageBookings]);

    const statusData = useMemo(() => {
        const statusMap = new Map();
        filteredBookings.forEach((booking) => {
            statusMap.set(booking.status, (statusMap.get(booking.status) || 0) + 1);
        });
        return [...statusMap.entries()].map(([name, value]) => ({ name, value }));
    }, [filteredBookings]);

    const capacityAlerts = usageBookings.filter((booking) => {
        const resource = resourceMap.get(String(booking.resourceId));
        const cap = Number(resource?.capacity || 0);
        return cap > 0 && Number(booking.attendees || 0) / cap >= 0.8;
    }).length;

    const resourceTypes = [...new Set(resources.map((resource) => resource.type).filter(Boolean))];

    if (loading) {
      return (
        <div className="py-40 flex flex-col items-center justify-center space-y-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Aggregating Intelligence...</p>
        </div>
      );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-700">
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between px-2">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/10 text-[10px] font-black uppercase tracking-widest text-blue-500">
                        <Activity className="size-3" />
                        System Intelligence Portal
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">Operations Analytics</h1>
                    <p className="text-sm font-medium text-muted-foreground">Real-time telemetry and resource utilization metrics.</p>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <div className="relative group">
                        <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-slate-950 text-[9px] font-black uppercase tracking-widest text-muted-foreground z-10">Timeframe</label>
                        <select
                            className="h-12 rounded-xl border border-border bg-white dark:bg-slate-900 pl-4 pr-10 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xl appearance-none min-w-[160px]"
                            value={rangeDays}
                            onChange={(e) => setRangeDays(Number(e.target.value))}
                        >
                            <option value={7}>Last 7 Cycles</option>
                            <option value={14}>Last 14 Cycles</option>
                            <option value={30}>Monthly Overview</option>
                            <option value={90}>Quarterly Audit</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                    
                    <div className="relative group">
                        <label className="absolute -top-2 left-3 px-1 bg-white dark:bg-slate-950 text-[9px] font-black uppercase tracking-widest text-muted-foreground z-10">Resource Filter</label>
                        <select
                            className="h-12 rounded-xl border border-border bg-white dark:bg-slate-900 pl-4 pr-10 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-xl appearance-none min-w-[200px]"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="ALL">All Asset Types</option>
                            {resourceTypes.map((type) => (
                                <option key={type} value={type}>{String(type).replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* High-Impact Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
                {[
                    { label: 'Total Requests', value: filteredBookings.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+12% vs last' },
                    { label: 'Seats Consumed', value: totalSeatsConsumed, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'Active Utilization' },
                    { label: 'Peak Saturation', value: hourlyUsage.length ? hourlyUsage.reduce((max, item) => Math.max(max, item.seats), 0) : 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: 'Critical Hours' },
                    { label: 'Usage Alerts', value: capacityAlerts, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: 'Needs Review' }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 group transition-all hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className={cn("p-4 rounded-2xl shadow-inner", stat.bg)}>
                                    <stat.icon className={cn("size-6", stat.color)} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                                    <h4 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-100">{stat.value}</h4>
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 mt-2">
                                        <ArrowUpRight className="size-3" />
                                        {stat.trend}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Visual Intelligence Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-1">
                {/* Daily Trend Analysis */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4">
                           <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                               <TrendingUp className="size-5" />
                           </div>
                           <div>
                               <CardTitle className="text-xl font-black">Capacity Flux Analysis</CardTitle>
                               <CardDescription>Daily seat consumption and request volume trends.</CardDescription>
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyTrend}>
                                    <defs>
                                        <linearGradient id="colorSeats" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dx={-10} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 700 }}
                                    />
                                    <Area type="monotone" dataKey="seats" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSeats)" name="Seats Reserved" />
                                    <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} fillOpacity={0} name="Requests" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Peak Hours Histogram */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4">
                           <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                               <Clock className="size-5" />
                           </div>
                           <div>
                               <CardTitle className="text-xl font-black">Temporal Load Density</CardTitle>
                               <CardDescription>Identifying peak operational hours across the campus.</CardDescription>
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyUsage}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dx={-10} />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 8 }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 700 }}
                                    />
                                    <Bar dataKey="seats" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Consumption Density" barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Resources Ranking */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4">
                           <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                               <BarChart3 className="size-5" />
                           </div>
                           <div>
                               <CardTitle className="text-xl font-black">High-Demand Assets</CardTitle>
                               <CardDescription>Top resources by aggregate seat reservation volume.</CardDescription>
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topResources} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 700 }}
                                    />
                                    <Bar dataKey="seats" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Aggregate Capacity" barSize={20} />
                                    <Bar dataKey="bookings" fill="#10b981" radius={[0, 6, 6, 0]} name="Booking Frequency" barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Allocation */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center gap-4">
                           <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                               <PieChartIcon className="size-5" />
                           </div>
                           <div>
                               <CardTitle className="text-xl font-black">Lifecycle Distribution</CardTitle>
                               <CardDescription>Breakdown of reservation requests by operational state.</CardDescription>
                           </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="55%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 700 }}
                                    />
                                    <Legend 
                                        verticalAlign="top" 
                                        align="right" 
                                        wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }} 
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
