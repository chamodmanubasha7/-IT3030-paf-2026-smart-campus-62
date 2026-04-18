import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/MockAuthContext';
import StatusTracker from './StatusTracker';
import CommentSection from './CommentSection';
import AdminControls from './AdminControls';
import { ArrowLeft, Paperclip } from 'lucide-react';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line
  }, [id]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch(err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) return <div className="app-container">Loading details...</div>;
  if (!ticket) return <div className="app-container">Ticket not found.</div>;

  return (
    <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="mb-4">
        <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="mb-1">{ticket.ticketNumber}</h2>
           <span className="text-secondary">{ticket.category} • Priority: <span className="badge" style={{background: 'rgba(255,255,255,0.1)'}}>{ticket.priority}</span></span>
        </div>
        <div style={{ textAlign: 'right' }}>
           <span className={`badge badge-${ticket.status}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
             {ticket.status}
           </span>
        </div>
      </div>

      <StatusTracker status={ticket.status} />

      <div className="flex flex-col gap-4 mb-8">
        <div className="form-group mb-0">
          <label className="form-label">Description</label>
          <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)' }}>
            {ticket.description}
          </div>
        </div>

        <div className="flex gap-4">
           <div className="flex-1 glass-panel" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)' }}>
              <label className="form-label">Reporter Info</label>
              <p><strong>Name:</strong> {ticket.reportedByName}</p>
              {ticket.contactEmail && <p><strong>Email:</strong> {ticket.contactEmail}</p>}
              {ticket.contactPhone && <p><strong>Phone:</strong> {ticket.contactPhone}</p>}
           </div>
           <div className="flex-1 glass-panel" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)' }}>
              <label className="form-label">Assignment</label>
              <p><strong>Technician:</strong> {ticket.assignedTechnicianName || 'Unassigned'}</p>
           </div>
        </div>
        
        {ticket.rejectionReason && (
           <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <strong style={{ color: '#fca5a5' }}>Rejection Reason:</strong>
              <p style={{ color: '#f8fafc', marginTop: '0.5rem' }}>{ticket.rejectionReason}</p>
           </div>
        )}
        
        {ticket.resolutionNotes && (
           <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <strong style={{ color: '#6ee7b7' }}>Resolution details:</strong>
              <p style={{ color: '#f8fafc', marginTop: '0.5rem' }}>{ticket.resolutionNotes}</p>
           </div>
        )}

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="flex items-center gap-2"><Paperclip size={18} /> Attachments ({ticket.attachments.length})</h4>
            <div className="flex gap-4 flex-wrap mt-2">
               {ticket.attachments.map(att => (
                 <a 
                   key={att.filename} 
                   href={`http://localhost:8081/api/tickets/attachments/${att.filename}`} 
                   target="_blank" 
                   rel="noreferrer"
                   className="glass-panel"
                   style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)' }}
                 >
                   <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{att.originalName}</span>
                 </a>
               ))}
            </div>
          </div>
        )}
      </div>

      {(role === 'ADMIN' || role === 'TECHNICIAN') && (
         <AdminControls ticket={ticket} onUpdated={(updatedTick) => setTicket(updatedTick)} />
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--panel-border)', margin: '2rem 0' }} />

      <CommentSection 
        ticketId={id} 
        comments={ticket.comments} 
        onCommentAdded={(c) => setTicket({...ticket, comments: [...(ticket.comments || []), c]})}
        onCommentDeleted={(cId) => setTicket({...ticket, comments: ticket.comments.filter(c => c.id !== cId)})}
        onCommentEdited={(updatedC) => setTicket({...ticket, comments: ticket.comments.map(c => c.id === updatedC.id ? updatedC : c)})}
      />
    </div>
  );
};

export default TicketDetailPage;
