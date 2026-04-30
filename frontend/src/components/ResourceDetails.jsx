import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Download, Calendar, ShieldCheck, Database, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BookingForm } from './BookingForm';
import { getResourceById } from '../api/resourceApi';
import { formatResourceTypeLabel, getResourceCapacity } from '../types/resource';

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
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '10rem' }}>
                <div className="spinner"></div>
                <p style={{ color: 'var(--accent-color)' }}>Loading resource details...</p>
            </div>
        );
    }

    if (!resource) return null;

    return (
        <div className="details-page animate-fade">
            <button className="btn btn-secondary details-back-btn" onClick={() => navigate('/')}>
                <ArrowLeft size={18} /> Back to Catalogue
            </button>

            <div className="details-layout">
                <section className="details-main">
                    <div className="details-hero">
                        {resource.imageUrl ? (
                            <img src={resource.imageUrl} alt={resource.name} />
                        ) : (
                            <div className="placeholder-img" style={{ fontSize: '5rem' }}>{resource.name.charAt(0)}</div>
                        )}

                        <div className="details-hero-overlay">
                            <span className="details-chip">{formatResourceTypeLabel(resource.type)}</span>
                            <span className={`details-chip ${resource.status === 'ACTIVE' ? 'chip-active' : 'chip-out'}`}>
                                {resource.status.replace('_', ' ')}
                            </span>
                            <h1>{resource.name}</h1>
                        </div>
                    </div>

                    <div className="details-info-cards">
                        <article className="details-info-card bg-slate-900/50 border border-slate-800">
                            <span className="details-label text-slate-400 font-medium"><MapPin size={14} /> Location</span>
                            <strong className="text-slate-100">{resource.location}</strong>
                        </article>
                        <article className="details-info-card bg-slate-900/50 border border-slate-800">
                            <span className="details-label text-slate-400 font-medium"><Users size={14} /> Capacity</span>
                            <strong className="text-slate-100">{getResourceCapacity(resource)} Seats</strong>
                        </article>
                        <article className="details-info-card bg-slate-900/50 border border-slate-800">
                            <span className="details-label text-slate-400 font-medium"><Clock size={14} /> Availability</span>
                            <strong className="text-slate-100">{resource.available ? 'Mon-Fri 08:00 - 20:00' : 'Currently unavailable'}</strong>
                        </article>
                    </div>

                    <section className="glass-panel details-description">
                        <h3><Database size={19} /> Resource Description</h3>
                        <p>
                            {resource.description || 'No detailed description available for this resource.'}
                        </p>
                        <ul className="details-feature-list">
                            <li><CheckCircle2 size={14} /> Booking capacity checks enabled</li>
                            <li><CheckCircle2 size={14} /> Access visibility by live status</li>
                            <li><CheckCircle2 size={14} /> Scheduling integrated with booking approvals</li>
                            <li><CheckCircle2 size={14} /> Real-time availability messaging in forms</li>
                        </ul>
                    </section>
                </section>

                <aside className="details-aside">
                    <div className="glass-panel quick-actions">
                        <h4><ShieldCheck size={17} /> Quick Actions</h4>
                        <p>Manage this resource for your upcoming usage.</p>
                        <button
                            className="btn btn-primary quick-btn"
                            onClick={() => setIsBookingOpen(true)}
                        >
                            <Calendar size={16} /> Schedule Resource
                        </button>
                        {resource.downloadUrl && (
                            <button className="btn btn-secondary quick-btn" onClick={() => window.open(resource.downloadUrl, '_blank')}>
                                <Download size={16} /> Download Info
                            </button>
                        )}
                    </div>

                    <div className="glass-panel details-health">
                        <div 
                            className="health-icon cursor-help transition-colors hover:bg-slate-800"
                            title={resource.available ? "Resource is active and has available booking slots" : "Resource is currently offline or fully booked"}
                        >
                            {resource.available ? 'i' : '!'}
                        </div>
                        <div className="health-meta">
                            <span className="text-slate-400">Status</span>
                            <strong className="text-slate-100">{resource.available ? 'Available for Booking' : 'Temporarily busy'}</strong>
                        </div>
                        <div className="health-bar">
                            <span style={{ width: resource.available ? '100%' : '28%', background: resource.available ? 'var(--success)' : 'var(--danger)' }} />
                        </div>
                    </div>
                </aside>
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
