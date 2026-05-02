import React, { useEffect, useMemo, useState } from 'react';
import { BookingCalendar } from './BookingCalendar';
import { createBooking, getTimeSlotAvailability } from '../api/bookingApi';
import { 
  Users, FileText, Clock, Check, AlertTriangle, 
  Calendar as CalendarIcon, Info, Loader2, ArrowRight
} from 'lucide-react';
import { getResourceCapacity } from '../types/resource';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const BookingForm = ({ resource, onClose, onSuccess }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [purpose, setPurpose] = useState('');
    const [attendees, setAttendees] = useState(1);
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState(null);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const selectedDateStr = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
    const resourceCapacity = useMemo(() => getResourceCapacity(resource), [resource]);
    const isTimeRangeInvalid = useMemo(() => startTime >= endTime, [startTime, endTime]);
    const requestedExceedsCapacity = attendees > resourceCapacity;
    const isSlotFullyBooked = Boolean(availability && Number(availability.remaining) <= 0);
    const predictedRemaining = availability
        ? Math.max((availability.remaining ?? resourceCapacity) - attendees, 0)
        : Math.max(resourceCapacity - attendees, 0);
    const lowCapacityThreshold = Math.max(Math.floor(resourceCapacity * 0.2), 1);
    const isLowCapacity = availability && (availability.remaining <= lowCapacityThreshold);
    const shouldBlockSubmit = loading
        || availabilityLoading
        || isTimeRangeInvalid
        || requestedExceedsCapacity;

    useEffect(() => {
        let isMounted = true;
        const fetchAvailability = async () => {
            if (!resource?.id || isTimeRangeInvalid) {
                setAvailability(null);
                return;
            }
            setAvailabilityLoading(true);
            try {
                const data = await getTimeSlotAvailability({
                    resourceId: resource.id,
                    date: selectedDateStr,
                    startTime,
                    endTime,
                    totalCapacity: resourceCapacity,
                });
                if (isMounted) setAvailability(data);
            } catch (error) {
                if (isMounted) setAvailability(null);
            } finally {
                if (isMounted) setAvailabilityLoading(false);
            }
        };
        fetchAvailability();
        return () => { isMounted = false; };
    }, [resource?.id, selectedDateStr, startTime, endTime, resourceCapacity, isTimeRangeInvalid]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validations
        const now = new Date();
        const bookingDate = new Date(selectedDateStr);
        if (bookingDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
            toast.error('Cannot book a date in the past.');
            return;
        }

        if (isTimeRangeInvalid) {
            toast.error('End time must be later than start time.');
            return;
        }
        if (requestedExceedsCapacity) {
            toast.error(`Attendees cannot exceed maximum capacity (${resourceCapacity}).`);
            return;
        }
        if (!purpose.trim()) {
            toast.error('Please specify the purpose of your booking.');
            return;
        }

        setLoading(true);
        const bookingData = {
            resourceId: resource.id,
            date: selectedDateStr,
            startTime,
            endTime,
            purpose,
            attendees
        };

        try {
            const created = await createBooking(bookingData);
            if (created?.status === 'WAITLISTED') {
                toast.success('Slot is full. You have been added to the waitlist.');
            } else {
                toast.success('Booking request submitted successfully!');
            }
            onSuccess();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to submit booking';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <Card className="max-w-4xl w-full bg-slate-900 border-slate-800 shadow-2xl animate-in zoom-in-95 duration-300">
                <CardHeader className="border-b border-slate-800/50 pb-6 relative">
                    <div className="flex items-center gap-3 text-teal-400 font-bold uppercase text-[10px] tracking-widest mb-1">
                        <CalendarIcon className="size-3.5" />
                        <span>Schedule Resource</span>
                    </div>
                    <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                        {resource.name}
                        <ArrowRight className="size-4 text-slate-600" />
                        <span className="text-teal-500">Reservation</span>
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Select your preferred date and time slot for this campus resource.
                    </CardDescription>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-4 top-4 text-slate-500 hover:text-white"
                        onClick={onClose}
                    >
                        <Check className="size-5 rotate-45" />
                    </Button>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            {/* Left: Calendar Component */}
                            <div className="p-8 bg-slate-950/30 border-r border-slate-800/50">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-4">1. Choose Date</Label>
                                <div className="bg-slate-900 rounded-2xl p-2 border border-slate-800 shadow-inner shadow-black/20">
                                    <BookingCalendar 
                                        selectedDate={selectedDate} 
                                        onDateChange={setSelectedDate} 
                                    />
                                </div>
                                <div className="mt-6 p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-start gap-3">
                                    <Info className="size-4 text-teal-500 mt-0.5" />
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Availability is calculated in real-time based on existing approved and pending reservations.
                                    </p>
                                </div>
                            </div>

                            {/* Right: Details Form */}
                            <div className="p-8 space-y-6">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-4">2. Booking Details</Label>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startTime" className="text-[10px] font-bold text-slate-400 uppercase">Start Time</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                            <Input 
                                                id="startTime"
                                                type="time" 
                                                className="pl-10 bg-slate-950/50 border-slate-800 h-11" 
                                                value={startTime} 
                                                onChange={(e) => setStartTime(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endTime" className="text-[10px] font-bold text-slate-400 uppercase">End Time</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                            <Input 
                                                id="endTime"
                                                type="time" 
                                                className="pl-10 bg-slate-950/50 border-slate-800 h-11" 
                                                value={endTime} 
                                                onChange={(e) => setEndTime(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Availability Intelligence Card */}
                                <Card className="bg-slate-950/80 border-slate-800 overflow-hidden shadow-inner shadow-black/20">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Live Availability</span>
                                            {availabilityLoading && <Loader2 className="size-3 text-teal-500 animate-spin" />}
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-center gap-4">
                                            <div className="flex-1 p-2 bg-slate-900 rounded-lg">
                                                <p className="text-lg font-black text-white">{resourceCapacity}</p>
                                                <p className="text-[8px] text-slate-500 font-black">TOTAL</p>
                                            </div>
                                            <div className="flex-1 p-2 bg-slate-900 rounded-lg">
                                                <p className="text-lg font-black text-indigo-400">{availability?.used ?? 0}</p>
                                                <p className="text-[8px] text-slate-500 font-black">BOOKED</p>
                                            </div>
                                            <div className="flex-1 p-2 bg-slate-900 rounded-lg border border-teal-500/20">
                                                <p className="text-lg font-black text-teal-400">{availability?.remaining ?? resourceCapacity}</p>
                                                <p className="text-[8px] text-slate-500 font-black">REMAINING</p>
                                            </div>
                                        </div>

                                        {isLowCapacity && (
                                            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/5 p-2 rounded border border-amber-500/20 text-[10px] font-bold uppercase">
                                                <AlertTriangle className="size-3" /> Limited Slots Available
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="space-y-2">
                                    <Label htmlFor="attendees" className="text-[10px] font-bold text-slate-400 uppercase">Requested Attendees</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                                        <Input 
                                            id="attendees"
                                            type="number" 
                                            className="pl-10 bg-slate-950/50 border-slate-800 h-11" 
                                            min="1" 
                                            value={attendees} 
                                            onChange={(e) => setAttendees(Math.max(1, Number.parseInt(e.target.value || '1', 10) || 1))} 
                                            required 
                                        />
                                    </div>
                                    {requestedExceedsCapacity && (
                                        <p className="text-rose-500 text-[10px] font-bold">Exceeds total asset capacity ({resourceCapacity})</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="purpose" className="text-[10px] font-bold text-slate-400 uppercase">Purpose of Use</Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 size-4 text-slate-500" />
                                        <textarea 
                                            id="purpose"
                                            className="w-full pl-10 pr-4 py-3 min-h-[100px] rounded-md border border-slate-800 bg-slate-950/50 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                            placeholder="Workshop, Study Session, Meeting..."
                                            value={purpose} 
                                            onChange={(e) => setPurpose(e.target.value)} 
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="p-8 border-t border-slate-800/50 bg-slate-950/30 flex justify-end gap-3 rounded-b-2xl">
                        <Button type="button" variant="ghost" className="text-slate-400 hover:text-white" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700 font-bold gap-2 px-8 shadow-lg shadow-teal-600/20 min-w-[180px]" disabled={shouldBlockSubmit}>
                            {loading ? <Loader2 className="size-4 animate-spin" /> : <><Check className="size-4"/> Send Request</>}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};
