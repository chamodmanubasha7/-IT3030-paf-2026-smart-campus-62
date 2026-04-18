import React, { useState } from 'react';
import api from '../services/api';

const AdminControls = ({ ticket, onUpdated }) => {
  const [status, setStatus] = useState(ticket.status);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = { status };
      if (status === 'REJECTED') payload.rejectionReason = notes;
      if (status === 'RESOLVED' || status === 'CLOSED') payload.resolutionNotes = notes;
      
      const res = await api.put(`/tickets/${ticket.id}/status`, payload);
      onUpdated(res.data);
      setNotes('');
    } catch(err) {
      console.error(err);
      alert('Failed to update status.');
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel mt-4" style={{ borderLeft: '4px solid var(--status-progress)' }}>
      <h4>Staff Controls</h4>
      
      <div className="flex gap-4 items-center mb-4">
        <label className="form-label mb-0">Change Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select" style={{ width: '200px' }}>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        
        {status === 'IN_PROGRESS' && !ticket.assignedTechnicianId && (
           <span className="badge badge-IN_PROGRESS">Will Self-Assign upon update</span>
        )}
      </div>

      {(status === 'REJECTED' || status === 'RESOLVED') && (
        <div className="form-group">
          <label className="form-label">{status === 'REJECTED' ? 'Rejection Reason' : 'Resolution Notes'}</label>
          <textarea 
            className="form-textarea" 
            rows="3" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Enter ${status === 'REJECTED' ? 'reason for rejection' : 'resolution details'}...`}
          />
        </div>
      )}

      <button onClick={handleUpdate} disabled={loading || status === ticket.status} className="btn btn-primary">
        Update Status
      </button>
    </div>
  );
};

export default AdminControls;
