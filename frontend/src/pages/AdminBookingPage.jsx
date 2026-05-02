import React, { useState, useEffect, useMemo } from 'react';
import { getAllBookings, approveBooking, rejectBooking, getTimeSlotAvailability, revokeApproval } from '../api/bookingApi';
import { 
  CheckCircle, XCircle, Clock, Users, Calendar as CalendarIcon, 
  MessageSquare, Shield, Search, Filter, RefreshCw, ArrowUpDown, 
  ChevronRight, Building2, User, AlertCircle, Info, MoreHorizontal
} from 'lucide-react';

import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const AdminBookingPage = ({ embedded = false }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const role = user?.role ?? 'USER';

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); 
    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortBy, setSortBy] = useState('ACTION_FIRST');
    
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
    const [overrideReason, setOverrideReason] = useState('');
    const [selectedBookingForOverride, setSelectedBookingForOverride] = useState(null);
    const [availabilityByBooking, setAvailabilityByBooking] = useState({});
    
    const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
    const [revokeReason, setRevokeReason] = useState('');
    const [selectedBookingIdForRevoke, setSelectedBookingIdForRevoke] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await getAllBookings();
            setBookings(data);
            const pending = data.filter((booking) => booking.status === 'PENDING');
            const pairs = await Promise.all(
                pending.map(async (booking) => {
                    try {
                        const availability = await getTimeSlotAvailability({
                            resourceId: booking.resourceId,
                            date: booking.date,
                            startTime: booking.startTime,
                            endTime: booking.endTime,
                            totalCapacity: 0,
                        });
                        return [booking.id, availability];
                    } catch (error) {
                        return [booking.id, null];
                    }
                })
            );
            setAvailabilityByBooking(Object.fromEntries(pairs));
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, options = {}) => {
        const { forceOverride = false, overrideReason: reason = '' } = options;
        const availability = availabilityByBooking[id];
        const booking = bookings.find((item) => item.id === id);
        const wouldExceedCapacity = availability && booking && Number(booking.attendees || 0) > Number(availability.remaining || 0);
        if (wouldExceedCapacity && !forceOverride) {
            toast.error(`Cannot approve. Only ${availability.remaining} seat(s) remaining in this slot.`);
            return;
        }
        if (forceOverride && !reason.trim()) {
            toast.error('Please provide a reason for capacity override');
            return;
        }
        try {
            await approveBooking(id, {
                forceOverride,
                overrideReason: forceOverride ? reason.trim() : undefined,
            });
            toast.success(forceOverride ? 'Booking approved with manual override' : 'Booking approved successfully');
            setIsOverrideModalOpen(false);
            setSelectedBookingForOverride(null);
            setOverrideReason('');
            fetchBookings();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to approve booking');
        }
    };

    const openOverrideModal = (booking) => {
        setSelectedBookingForOverride(booking);
        setOverrideReason('');
        setIsOverrideModalOpen(true);
    };

    const openRejectModal = (id) => {
        setSelectedBookingId(id);
        setRejectionReason('');
        setIsRejectModalOpen(true);
    };

    const handleReject = async () => {
        if (!selectedBookingId) return;
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }
        try {
            await rejectBooking(selectedBookingId, rejectionReason);
            toast.success('Booking rejected');
            setIsRejectModalOpen(false);
            fetchBookings();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to reject booking');
        }
    };

    const openRevokeModal = (id) => {
        setSelectedBookingIdForRevoke(id);
        setRevokeReason('');
        setIsRevokeModalOpen(true);
    };

    const handleRevoke = async () => {
        if (!selectedBookingIdForRevoke) return;
        if (!revokeReason.trim()) {
            toast.error('Please provide a reason for revoking approval');
            return;
        }
        try {
            await revokeApproval(selectedBookingIdForRevoke, revokeReason);
            toast.success('Approval revoked successfully');
            setIsRevokeModalOpen(false);
            fetchBookings();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to revoke approval');
        }
    };

    const filteredBookings = useMemo(() => {
        const ACTION_STATUS_ORDER = {
            PENDING: 0,
            WAITLISTED: 1,
            APPROVED: 2,
            REJECTED: 3,
            CANCELLED: 4,
        };

        const toDateTime = (booking) => {
            const dateValue = booking?.date ?? '';
            const timeValue = booking?.startTime ?? '00:00';
            const parsed = new Date(`${dateValue}T${timeValue}`);
            return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
        };

        const query = search.toLowerCase();

        const filtered = bookings.filter((b) => {
            const matchesFilter = filter === 'ALL' || b.status === filter;
            const resourceName = String(b?.resourceName ?? '').toLowerCase();
            const userName = String(b?.userName ?? '').toLowerCase();
            const bookingId = String(b?.id ?? '');
            const matchesSearch = resourceName.includes(query) || userName.includes(query) || bookingId.includes(query);
            const matchesDate = !dateFilter || b?.date === dateFilter;
            return matchesFilter && matchesSearch && matchesDate;
        });

        return filtered.sort((a, b) => {
            if (sortBy === 'DATE_ASC') return toDateTime(a) - toDateTime(b);
            if (sortBy === 'DATE_DESC') return toDateTime(b) - toDateTime(a);
            if (sortBy === 'QUEUE_FIRST') {
                const aWait = a.status === 'WAITLISTED' ? 0 : 1;
                const bWait = b.status === 'WAITLISTED' ? 0 : 1;
                if (aWait !== bWait) return aWait - bWait;
            }

            const aOrder = ACTION_STATUS_ORDER[a.status] ?? 99;
            const bOrder = ACTION_STATUS_ORDER[b.status] ?? 99;
            if (aOrder !== bOrder) return aOrder - bOrder;
            return toDateTime(b) - toDateTime(a);
        });
    }, [bookings, filter, search, dateFilter, sortBy]);

    const waitlistQueueByBookingId = useMemo(() => {
        const queueMap = new Map();
        const grouped = new Map();

        bookings
            .filter((booking) => booking.status === 'WAITLISTED')
            .forEach((booking) => {
                const key = `${booking.resourceId}|${booking.date}|${booking.startTime}|${booking.endTime}`;
                const current = grouped.get(key) || [];
                current.push(booking);
                grouped.set(key, current);
            });

        grouped.forEach((items) => {
            items
                .sort((a, b) => {
                    const left = new Date(a.waitlistedAt || a.createdAt || 0).getTime();
                    const right = new Date(b.waitlistedAt || b.createdAt || 0).getTime();
                    if (left !== right) return left - right;
                    return String(a.id || '').localeCompare(String(b.id || ''));
                })
                .forEach((item, index) => queueMap.set(item.id, index + 1));
        });

        return queueMap;
    }, [bookings]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'WAITLISTED': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            case 'REJECTED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'CANCELLED': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusLabel = (booking) => {
        if (booking.status === 'WAITLISTED') {
            const queuePosition = waitlistQueueByBookingId.get(booking.id);
            return queuePosition ? `QUEUED (#${queuePosition})` : 'QUEUED';
        }
        return booking.status;
    };

    if (loading) {
      return (
        <div className="py-40 flex flex-col items-center justify-center space-y-4">
          <div className="size-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Reservation Flow...</p>
        </div>
      );
    }

    const content = (
        <div className={cn("space-y-8 pb-20 animate-in fade-in duration-700", embedded ? "" : "p-8 container")}>
            {/* Premium Header */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/10 text-[10px] font-black uppercase tracking-widest text-blue-500">
                        <Shield className="size-3" />
                        Administration Authority
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">Reservation Control</h1>
                    <p className="text-sm font-medium text-muted-foreground">Orchestrating {bookings.length} campus facility requests.</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-border bg-white dark:bg-slate-900 font-bold shadow-xl transition-all hover:bg-slate-50" onClick={fetchBookings}>
                        <RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} /> Synchronize
                    </Button>
                </div>
            </div>

            {/* Global Filters Area */}
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Search className="size-3" /> Intelligence Search</label>
                            <Input
                                placeholder="User, Asset, or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-border/50 font-bold focus:ring-blue-500 shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Filter className="size-3" /> Flow Status</label>
                            <select
                                className="flex h-12 w-full rounded-2xl border border-border/50 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="ALL">Total Inventory</option>
                                <option value="PENDING">Pending Review</option>
                                <option value="WAITLISTED">Waitlisted Flow</option>
                                <option value="APPROVED">Operational/Approved</option>
                                <option value="REJECTED">Rejected Requests</option>
                                <option value="CANCELLED">Terminated</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><CalendarIcon className="size-3" /> Scheduled Date</label>
                            <Input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-border/50 font-bold focus:ring-blue-500 shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><ArrowUpDown className="size-3" /> Priority Sort</label>
                            <select
                                className="flex h-12 w-full rounded-2xl border border-border/50 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="ACTION_FIRST">Actionable (Pending/Queue)</option>
                                <option value="DATE_DESC">Chronological (Newest)</option>
                                <option value="DATE_ASC">Chronological (Oldest)</option>
                                <option value="QUEUE_FIRST">Waitlist Priority</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Stream */}
            <div className="grid gap-6">
                {filteredBookings.length === 0 ? (
                    <div className="py-32 text-center space-y-6">
                        <div className="mx-auto size-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                           <CalendarIcon className="size-10" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">No Reservations Found</h3>
                          <p className="text-muted-foreground font-medium max-w-sm mx-auto">The digital archives do not contain any records matching these parameters.</p>
                        </div>
                        <Button variant="outline" className="rounded-xl h-12 px-8 font-bold" onClick={() => { setSearch(''); setFilter('ALL'); setDateFilter(''); }}>Reset Protocol</Button>
                    </div>
                ) : (
                    filteredBookings.map(booking => {
                        const availability = availabilityByBooking[booking.id];
                        const wouldExceedCapacity = Boolean(
                            availability && booking.status === 'PENDING'
                            && Number(booking.attendees || 0) > Number(availability.remaining || 0)
                        );
                        return (
                        <Card key={booking.id} className="group border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 transition-all hover:shadow-blue-500/5 hover:-translate-y-1">
                            <CardContent className="p-0">
                                <div className="grid lg:grid-cols-[1fr_300px]">
                                    <div className="p-8 lg:p-10 space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                        <Building2 className="size-5" />
                                                    </div>
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{booking.resourceName}</h3>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground ml-13">
                                                   <span className="text-blue-500">RES-ID:</span> {booking.id.slice(0, 12)}
                                                </div>
                                            </div>
                                            <Badge className={cn("rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest border shadow-sm", getStatusStyle(booking.status))}>
                                                {getStatusLabel(booking)}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scheduled Slot</p>
                                                <div className="flex items-center gap-2 font-bold text-sm">
                                                    <CalendarIcon className="size-4 text-blue-400" />
                                                    {booking.date}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time Window</p>
                                                <div className="flex items-center gap-2 font-bold text-sm">
                                                    <Clock className="size-4 text-amber-400" />
                                                    {booking.startTime} - {booking.endTime}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Occupancy</p>
                                                <div className="flex items-center gap-2 font-bold text-sm">
                                                    <Users className="size-4 text-indigo-400" />
                                                    {booking.attendees} <span className="text-[10px] font-black opacity-50 uppercase tracking-widest ml-1">Delegates</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Requesting Entity</p>
                                                <div className="flex items-center gap-2 font-bold text-sm">
                                                    <User className="size-4 text-emerald-400" />
                                                    {booking.userName}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-border/30 space-y-3">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><MessageSquare className="size-3" /> Declaration of Purpose</h4>
                                            <p className="text-sm font-medium leading-relaxed italic">"{booking.purpose || 'No official declaration provided.'}"</p>
                                        </div>

                                        {availability && (
                                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                                                <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                    Slot Utilization: <span className="text-slate-900 dark:text-slate-100 ml-1">{availability.used} / {availability.total}</span>
                                                </div>
                                                <div className={cn("px-3 py-1.5 rounded-full", availability.remaining > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
                                                    Available Bandwidth: {availability.remaining} Seats
                                                </div>
                                            </div>
                                        )}

                                        {booking.rejectionReason && (
                                            <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 text-rose-600 space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                                    <XCircle className="size-4" /> System Rejection Logs
                                                </div>
                                                <p className="text-sm font-medium italic">"{booking.rejectionReason}"</p>
                                            </div>
                                        )}

                                        {booking.capacityOverridden && (
                                            <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-600 space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                                    <Shield className="size-4" /> Manual Authority Override
                                                </div>
                                                <p className="text-sm font-medium italic">"{booking.overrideReason}"</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Panel */}
                                    <div className="bg-slate-50 dark:bg-slate-950/50 p-8 lg:p-10 border-l border-border/30 flex flex-col justify-center gap-4">
                                        {booking.status === 'PENDING' && (
                                            <>
                                                <Button
                                                    className={cn("h-14 rounded-2xl font-black shadow-xl transition-all active:scale-95", wouldExceedCapacity ? "bg-amber-600 hover:bg-amber-500" : "bg-blue-600 hover:bg-blue-500")}
                                                    onClick={() => (wouldExceedCapacity ? openOverrideModal(booking) : handleApprove(booking.id))}
                                                >
                                                    <CheckCircle className="mr-2 size-5" /> 
                                                    {wouldExceedCapacity ? 'Override & Approve' : 'Authorize Request'}
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    className="h-14 rounded-2xl font-black text-rose-500 hover:bg-rose-500/10 hover:text-rose-600" 
                                                    onClick={() => openRejectModal(booking.id)}
                                                >
                                                    <XCircle className="mr-2 size-5" /> Decline Request
                                                </Button>
                                            </>
                                        )}
                                        {booking.status === 'APPROVED' && (
                                            <Button 
                                                variant="ghost" 
                                                className="h-14 rounded-2xl font-black text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 shadow-xl" 
                                                onClick={() => openRevokeModal(booking.id)}
                                            >
                                                <RefreshCw className="mr-2 size-5" /> Revoke Privilege
                                            </Button>
                                        )}
                                        {booking.status === 'REJECTED' && (
                                             <div className="text-center py-6">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500/60">Final Protocol: Terminated</p>
                                             </div>
                                        )}
                                         {booking.status === 'CANCELLED' && (
                                             <div className="text-center py-6">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500/60">Final Protocol: User Withdrawn</p>
                                             </div>
                                        )}
                                        <div className="mt-auto pt-6 border-t border-border/30">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                                                    {booking.userName?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action Timestamp</p>
                                                    <p className="text-[11px] font-bold truncate">Last sync: {new Date().toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
                )}
            </div>

            {/* Premium Modals */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                        <div className="p-8 border-b border-border/50 bg-rose-500/5 text-rose-500">
                            <h3 className="text-2xl font-black flex items-center gap-3"><AlertCircle className="size-6" /> Decline Request</h3>
                            <p className="text-sm font-medium opacity-80 mt-1">Specify technical or operational reasons for rejection.</p>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            <textarea
                                className="flex min-h-[150px] w-full rounded-2xl border border-border/50 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                                placeholder="e.g. Schedule collision detected, Maintenance in progress..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsRejectModalOpen(false)}>Discard</Button>
                                <Button className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 font-black shadow-xl shadow-rose-500/20" onClick={handleReject}>Confirm Decline</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {isOverrideModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                        <div className="p-8 border-b border-border/50 bg-amber-500/5 text-amber-600">
                            <h3 className="text-2xl font-black flex items-center gap-3"><Shield className="size-6" /> Capacity Override</h3>
                            <p className="text-sm font-medium opacity-80 mt-1">Critical saturation reached. Authorize manual exception?</p>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            {selectedBookingForOverride && (
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-700 uppercase tracking-widest space-y-1">
                                    <p>Asset: {selectedBookingForOverride.resourceName}</p>
                                    <p>Time: {selectedBookingForOverride.date} {selectedBookingForOverride.startTime}</p>
                                </div>
                            )}
                            <textarea
                                className="flex min-h-[120px] w-full rounded-2xl border border-border/50 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                                placeholder="State the justification for capacity override..."
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsOverrideModalOpen(false)}>Abort</Button>
                                <Button className="flex-1 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 font-black shadow-xl shadow-amber-500/20" onClick={() => handleApprove(selectedBookingForOverride?.id, { forceOverride: true, overrideReason })}>
                                    Confirm Override
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {isRevokeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900">
                        <div className="p-8 border-b border-border/50 bg-rose-500/5 text-rose-500">
                            <h3 className="text-2xl font-black flex items-center gap-3"><RefreshCw className="size-6" /> Revoke Privilege</h3>
                            <p className="text-sm font-medium opacity-80 mt-1">Revert authorized state to pending. This action is logged.</p>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            <textarea
                                className="flex min-h-[120px] w-full rounded-2xl border border-border/50 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                                placeholder="Justification for revoking approved status..."
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsRevokeModalOpen(false)}>Discard</Button>
                                <Button className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 font-black shadow-xl shadow-rose-500/20" onClick={handleRevoke}>Confirm Revoke</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );

    return content;
};
