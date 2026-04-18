import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/MockAuthContext';
import { Trash2, User, Edit2, X, Check } from 'lucide-react';

const CommentSection = ({ ticketId, comments, onCommentAdded, onCommentDeleted, onCommentEdited }) => {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const { userId, role } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/tickets/${ticketId}/comments`, { text: newComment });
      setNewComment('');
      onCommentAdded(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/tickets/${ticketId}/comments/${commentId}`);
      if (onCommentDeleted) onCommentDeleted(commentId);
    } catch (err) {
      console.error(err);
      alert('You cannot delete this comment.');
    }
  };

  const handleEditSave = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const res = await api.put(`/tickets/${ticketId}/comments/${commentId}`, { text: editText });
      if (onCommentEdited) onCommentEdited(res.data);
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error(err);
      alert('Failed to edit comment.');
    }
  };

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="mt-4">
      <h3 className="mb-4">Comments</h3>
      
      <div className="flex flex-col gap-4 mb-8">
        {!comments || comments.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>No comments yet.</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="glass-panel" style={{ padding: '1rem' }}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div style={{ background: 'var(--panel-border)', padding: '0.25rem', borderRadius: '50%' }}>
                    <User size={16} />
                  </div>
                  <strong>{c.authorName}</strong>
                  <span className="badge badge-role" style={{ fontSize: '0.65rem' }}>{c.role}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  {c.authorId === userId && editingId !== c.id && (
                    <button onClick={() => startEditing(c)} className="btn btn-outline" style={{ padding: '0.35rem' }} title="Edit">
                      <Edit2 size={16} />
                    </button>
                  )}
                  {(c.authorId === userId || role === 'ADMIN') && editingId !== c.id && (
                    <button onClick={() => handleDelete(c.id)} className="btn btn-danger" style={{ padding: '0.35rem' }} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              {editingId === c.id ? (
                <div className="mt-2 text-right">
                  <textarea 
                    className="form-textarea w-full mb-2" 
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)} 
                    rows="2"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={cancelEdit} className="btn btn-outline" style={{ padding: '0.35rem 0.75rem' }}><X size={16} /></button>
                    <button onClick={() => handleEditSave(c.id)} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem' }}><Check size={16} /></button>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>{c.text}</p>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment}>
        <div className="form-group mb-2">
          <textarea 
            rows="3" 
            className="form-textarea" 
            placeholder="Write a comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading || !newComment.trim()}>
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
