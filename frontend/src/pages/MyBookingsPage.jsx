import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking, getBookingHistory } from '../api/bookingApi';
import { BookingHistory } from '../components/BookingHistory';
import { 
  Calendar, Clock, MapPin, XCircle, Info, 
  RefreshCw, MessageSquare, ExternalLink, 
  ChevronRight, AlertCircle, CheckCircle2,
  Trash2, History, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const data = await getMyBookings();
            setBookings(data);
        } catch (err) {
            toast.error('Failed to load your bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await cancelBooking(id);
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const handleViewHistory = async (id) => {
        try {
            const history = await getBookingHistory(id);
            setSelectedHistory(history);
            setShowHistoryModal(true);
        } catch (err) {
            toast.error('Failed to load booking history');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            APPROVED: "bg-teal-500/10 text-teal-500 border-teal-500/20",
            PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            WAITLISTED: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
            REJECTED: "bg-rose-500/10 text-rose-500 border-rose-500/20",
            CANCELLED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        };
        return (
            <Badge className={`${styles[status] || 'bg-slate-500/10'} border font-bold px-2 py-0.5 text-[10px]`}>
                {status === 'WAITLISTED' ? 'WAITLISTED' : status}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="size-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse text-sm">Retrieving your reservations...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-teal-400 font-bold uppercase text-xs tracking-widest">
                        <Calendar className="size-4" />
                        <span>Reservations</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white leading-none">
                        My <span className="text-teal-500">Bookings</span>
                    </h1>
                    <p className="text-slate-400 max-w-lg text-sm font-medium">
                        Track and manage your scheduled facilities and resource requests.
                    </p>
                </div>

                <Button 
                    variant="outline" 
                    className="border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white rounded-xl h-11"
                    onClick={fetchBookings}
                >
                    <RefreshCw className="mr-2 size-4" /> Sync Records
                </Button>
            </div>

            {/* Content Area */}
            {bookings.length === 0 ? (
                <Card className="bg-slate-900/20 border-slate-800 border-dashed py-20 flex flex-col items-center justify-center text-center">
                    <div className="size-20 rounded-3xl bg-slate-900 flex items-center justify-center mb-6">
                        <Calendar className="size-8 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Active Bookings</h3>
                    <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                        You haven't made any resource reservations yet. Head over to the catalogue to find a space.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {bookings.map(booking => (
                        <Card key={booking.id} className="bg-slate-900/40 border-slate-800/60 overflow-hidden group hover:border-teal-500/30 transition-all">
                            <div className="flex flex-col lg:flex-row">
                                {/* Side Accent */}
                                <div className={`w-1.5 shrink-0 ${
                                    booking.status === 'APPROVED' ? 'bg-teal-500' :
                                    booking.status === 'PENDING' ? 'bg-amber-500' :
                                    booking.status === 'WAITLISTED' ? 'bg-indigo-500' :
                                    'bg-slate-700'
                                }`} />
                                
                                <div className="flex-1 p-6">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-black text-white">{booking.resourceName}</h3>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                                <MapPin className="size-3.5 text-teal-500" />
                                                <span>{booking.resourceLocation}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2 text-sm font-bold text-white bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                                                <Calendar className="size-4 text-teal-500" />
                                                {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pr-2">
                                                {booking.startTime} — {booking.endTime}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Booking Purpose</p>
                                            <p className="text-sm text-slate-300 font-medium leading-tight">
                                                {booking.purpose || 'General Academic Use'}
                                            </p>
                                        </div>
                                        
                                        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Reservation Type</p>
                                            <div className="flex items-center gap-2">
                                                <Building2 className="size-4 text-teal-500" />
                                                <span className="text-sm text-slate-300 font-bold">Standard Request</span>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Notifications</p>
                                            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
                                                <CheckCircle2 className="size-4" />
                                                Email Alerts Active
                                            </div>
                                        </div>
                                    </div>

                                    {booking.rejectionReason && (
                                        <div className="mb-6 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex gap-3">
                                            <AlertCircle className="size-5 text-rose-500 shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-rose-500 uppercase tracking-wider">Rejection Notice</p>
                                                <p className="text-sm text-slate-300">{booking.rejectionReason}</p>
                                            </div>
                                        </div>
                                    )}

                                    {booking.status === 'WAITLISTED' && (
                                        <div className="mb-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex gap-3">
                                            <Info className="size-5 text-indigo-400 shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-wider">Queue Position</p>
                                                <p className="text-sm text-slate-300">This request is in the waitlist. You will be auto-promoted when capacity becomes available.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                                        <div className="flex gap-3">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-slate-400 hover:text-white font-bold text-xs"
                                                onClick={() => handleViewHistory(booking.id)}
                                            >
                                                <History className="mr-2 size-3.5 text-teal-500" /> Audit Logs
                                            </Button>
                                        </div>
                                        
                                        {(booking.status === 'PENDING' || booking.status === 'APPROVED' || booking.status === 'WAITLISTED') && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 font-bold text-xs"
                                                onClick={() => handleCancel(booking.id)}
                                            >
                                                <Trash2 className="mr-2 size-3.5" /> Cancel Reservation
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl bg-slate-900 border-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
                        <CardHeader className="border-b border-slate-800/50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black text-white flex items-center gap-2">
                                    <History className="size-5 text-teal-500" />
                                    Booking Audit Trail
                                </CardTitle>
                                <Button variant="ghost" className="text-slate-500" onClick={() => setShowHistoryModal(false)}>
                                    <XCircle className="size-5" />
                                </Button>
                            </div>
                            <CardDescription>Review all state changes and system actions for this reservation.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <BookingHistory history={selectedHistory} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
