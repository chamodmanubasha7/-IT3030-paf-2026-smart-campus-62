import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, X } from 'lucide-react';

const TicketSubmissionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: 'GENERAL',
    priority: 'LOW',
    description: '',
    contactEmail: '',
    contactPhone: '',
    preferredContactMethod: 'EMAIL',
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 3) {
      alert("Maximum 3 files allowed as evidence.");
      return;
    }
    setFiles([...files, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const data = new FormData();
    data.append('category', formData.category);
    data.append('priority', formData.priority);
    data.append('description', formData.description);
    data.append('contactEmail', formData.contactEmail);
    data.append('contactPhone', formData.contactPhone);
    data.append('preferredContactMethod', formData.preferredContactMethod);
    
    files.forEach(f => {
      data.append('files', f);
    });

    try {
      const res = await api.post('/tickets', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit ticket.");
    }
    setSubmitting(false);
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem' }}>Report a New Incident</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4 mb-4">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="form-select">
              <option value="GENERAL">General Maintenance</option>
              <option value="ELECTRICAL">Electrical Issue</option>
              <option value="PLUMBING">Plumbing Issue</option>
              <option value="HVAC">Heating / AC</option>
              <option value="NETWORK">Network / IT</option>
            </select>
          </div>
          
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Priority Level</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="form-select">
              <option value="LOW">Low (Routine)</option>
              <option value="MEDIUM">Medium (Needs attention)</option>
              <option value="HIGH">High (Urgent)</option>
              <option value="CRITICAL">Critical (Emergency)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Detailed Description</label>
          <textarea 
            name="description" 
            rows="5" 
            value={formData.description} 
            onChange={handleChange} 
            className="form-textarea" 
            required 
            placeholder="Please provide specifics about the issue..."
          />
        </div>
        
        <div className="flex gap-4 mb-4">
           <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Contact Email</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="form-input" />
           </div>
           <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Contact Phone</label>
              <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="form-input" />
           </div>
        </div>

        <div className="form-group">
           <label className="form-label">Attach Evidence (Max 3 Images)</label>
           
           <label className="file-upload-zone block" htmlFor="fileUpload">
              <UploadCloud size={48} color="var(--primary-color)" style={{ margin: '0 auto 1rem' }} />
              <p>Click to browse images or drag them here.</p>
           </label>
           <input 
              id="fileUpload" 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
            />
            
            {files.length > 0 && (
              <div className="flex gap-4 mt-4 flex-wrap">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2" style={{ background: 'var(--panel-bg)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
                     <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{file.name}</span>
                     <button type="button" onClick={() => removeFile(idx)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--status-rejected)' }}><X size={16}/></button>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--panel-border)' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Incident Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketSubmissionForm;
