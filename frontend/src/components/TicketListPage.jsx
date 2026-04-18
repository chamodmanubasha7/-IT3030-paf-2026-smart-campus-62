import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/MockAuthContext';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const TicketListPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, [role]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'OPEN': return <AlertCircle size={16} />;
      case 'IN_PROGRESS': return <Clock size={16} />;
      case 'RESOLVED': return <CheckCircle size={16} />;
      default: return null;
    }
  };

  if (loading) return <div className="app-container">Loading...</div>;

  return (
    <div className="glass-panel">
      <div className="flex justify-between items-center mb-8">
        <h2>{role === 'USER' ? 'My Tickets' : 'All Tickets Queue'}</h2>
        {role === 'USER' && (
          <Link to="/new" className="btn btn-primary">Report Incident</Link>
        )}
      </div>

      {tickets.length === 0 ? (
        <p className="text-muted">No tickets found.</p>
      ) : (
        <div className="ticket-grid">
          {tickets.map(t => (
            <Link key={t.id} to={`/tickets/${t.id}`} className="glass-panel ticket-card" style={{ padding: '1.25rem' }}>
              <div className="ticket-card-header">
                <strong>{t.ticketNumber}</strong>
                <span className={`badge badge-${t.status}`}>
                  <span className="flex items-center gap-2">{getStatusIcon(t.status)} {t.status}</span>
                </span>
              </div>
              
              <h4 style={{ margin: '0.5rem 0' }}>{t.category} Issue</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>
                {t.description.length > 80 ? t.description.substring(0, 80) + '...' : t.description}
              </p>

              <div className="ticket-card-footer">
                <span>Priority: <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{t.priority}</span></span>
                <span>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketListPage;
