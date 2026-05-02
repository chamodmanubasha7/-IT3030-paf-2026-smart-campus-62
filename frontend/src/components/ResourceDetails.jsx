import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Users, Download, Calendar, 
  ShieldCheck, Database, Clock, CheckCircle2, 
  Building2, Activity, Info, ExternalLink, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BookingForm } from './BookingForm';
import { getResourceById } from '../api/resourceApi';
import { formatResourceTypeLabel, getResourceCapacity } from '../types/resource';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const ResourceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const data = await getResourceById(id);
                setResource(data);
            } catch (err) {
                toast.error('Failed to load resource details.');
                navigate('/resources');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="size-12 text-teal-500 animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Retrieving Asset Intelligence...</p>
            </div>
        );
    }

    if (!resource) return null;

    const getStatusBadge = (status) => {
        const styles = {
            ACTIVE: "bg-teal-500/30 text-teal-400 border-teal-500/40",
            MAINTENANCE: "bg-amber-500/30 text-amber-400 border-amber-500/40",
            OUT_OF_SERVICE: "bg-rose-500/30 text-rose-400 border-rose-500/40",
        };
        return <Badge className={`${styles[status] || 'bg-slate-500/20'} border font-black px-3 py-1 text-[10px] uppercase tracking-widest`}>{status.replace('_', ' ')}</Badge>;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-8">
                <Button 
                    variant="ghost" 
                    className="text-slate-400 hover:text-white hover:bg-slate-900 group"
                    onClick={() => navigate('/resources')}
                >
                    <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" /> 
                    Back to Catalogue
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resource ID:</span>
                    <code className="text-[10px] bg-slate-900 px-2 py-1 rounded text-teal-400 border border-slate-800">#{resource.id.slice(-8)}</code>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Main Content Side */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Hero Section */}
                    <Card className="overflow-hidden border-slate-800 bg-slate-900/40 backdrop-blur-md">
                        <div className="relative aspect-video sm:aspect-[21/9]">
                            {resource.imageUrl ? (
                                <img src={resource.imageUrl} alt={resource.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-950">
                                    <Building2 className="size-24 text-slate-900" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge className="bg-teal-600 text-white border-none">{formatResourceTypeLabel(resource.type)}</Badge>
                                    {getStatusBadge(resource.status)}
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">{resource.name}</h1>
                            </div>
                        </div>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Campus Sector</p>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <MapPin className="size-4 text-teal-500" />
                                        <span>{resource.location}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Max Capacity</p>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Users className="size-4 text-teal-500" />
                                        <span>{getResourceCapacity(resource)} Seats</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Standard Hours</p>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <Clock className="size-4 text-teal-500" />
                                        <span>08:00 - 20:00</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description & Features */}
                    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Database className="size-5 text-teal-500" />
                                Resource Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <p className="text-slate-300 leading-relaxed">
                                {resource.description || 'This university asset is part of the Smart Campus integrated facility management system. It is regularly maintained to ensure optimal operational performance for students and staff.'}
                            </p>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    'Real-time occupation monitoring',
                                    'Digital keyless access enabled',
                                    'Automated lighting & HVAC control',
                                    'Integrated incident reporting'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                                        <CheckCircle2 className="size-4 text-teal-500" />
                                        <span className="text-sm font-medium text-slate-400">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Actions */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-teal-600 border-none shadow-2xl shadow-teal-600/20 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Calendar className="size-5" />
                                Reservations
                            </CardTitle>
                            <CardDescription className="text-teal-100/70 font-medium">
                                Reserve this space for your academic or organizational needs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-0">
                            <Button 
                                className="w-full h-12 bg-white text-teal-700 hover:bg-teal-50 font-black tracking-tight"
                                onClick={() => setIsBookingOpen(true)}
                                disabled={resource.status !== 'ACTIVE'}
                            >
                                Schedule Now
                            </Button>
                        </CardContent>
                        {resource.status !== 'ACTIVE' && (
                            <div className="px-6 pb-6 relative z-10">
                                <p className="text-[10px] text-teal-200 font-bold text-center">
                                    Asset is currently unavailable for scheduling.
                                </p>
                            </div>
                        )}
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2 text-slate-300">
                                <ShieldCheck className="size-4 text-teal-500" />
                                Asset Compliance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Last Inspection</span>
                                <span className="text-white font-bold">April 12, 2026</span>
                            </div>
                            <Separator className="bg-slate-800" />
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Health Index</span>
                                <span className="text-teal-400 font-black">98% OPTIMAL</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500 w-[98%]" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-800 border-dashed">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                                <div className="size-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 flex-shrink-0">
                                    <Info className="size-5 text-slate-500" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-slate-300 leading-tight">Technical Documents</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">Access maintenance manuals and floor plans for this resource.</p>
                                    <Button variant="link" className="p-0 h-auto text-teal-500 font-bold text-xs gap-1" disabled={!resource.downloadUrl}>
                                        Download PDF <Download className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {isBookingOpen && (
                <BookingForm 
                    resource={resource} 
                    onClose={() => setIsBookingOpen(false)} 
                    onSuccess={() => {
                        setIsBookingOpen(false);
                        navigate('/bookings/my');
                    }}
                />
            )}
        </div>
    );
};
