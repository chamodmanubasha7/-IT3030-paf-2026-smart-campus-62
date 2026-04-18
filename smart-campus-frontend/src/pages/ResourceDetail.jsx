import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLocationMarker,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineOfficeBuilding,
  HiOutlineCube
} from 'react-icons/hi';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';

/**
 * Detailed view of a single resource with all metadata.
 */
export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    loadResource();
  }, [id]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getResourceById(id);
      setResource(data);
    } catch (error) {
      toast.error('Resource not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await resourceService.deleteResource(id);
      toast.success('Resource deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      LECTURE_HALL: '🏫',
      LAB: '🔬',
      MEETING_ROOM: '🏢',
      PROJECTOR: '📽️',
      CAMERA: '📷',
      WHITEBOARD: '📋',
      COMPUTER: '💻',
      OTHER: '📦'
    };
    return icons[type] || '📦';
  };

  const getStatusClass = (status) => {
    const classes = {
      ACTIVE: 'active',
      OUT_OF_SERVICE: 'out-of-service',
      UNDER_MAINTENANCE: 'under-maintenance'
    };
    return classes[status] || '';
  };

  const formatStatus = (status) => status?.replace(/_/g, ' ') || '';
  const formatType = (type) => type?.replace(/_/g, ' ') || '';

  const formatDateTime = (dt) => {
    if (!dt) return 'N/A';
    return new Date(dt).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!resource) return null;

  return (
    <div className="detail-container">
      <div className="page-header">
        <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}>
          <HiOutlineArrowLeft /> Back to Catalogue
        </Link>
      </div>

      <div className="detail-card">
        {resource.imageUrl ? (
          <img src={resource.imageUrl} alt={resource.name} className="detail-image" />
        ) : (
          <div className="detail-image-placeholder">
            {getTypeIcon(resource.type)}
          </div>
        )}

        <div className="detail-body">
          <h1 className="detail-title">{resource.name}</h1>

          <div className="detail-badges">
            <span className="type-badge">
              <HiOutlineCube /> {formatType(resource.type)}
            </span>
            <span className={`status-badge ${getStatusClass(resource.status)}`}>
              {formatStatus(resource.status)}
            </span>
          </div>

          {resource.description && (
            <p className="detail-desc">{resource.description}</p>
          )}

          <div className="detail-info-grid">
            <div className="detail-info-item">
              <span className="detail-info-label">Location</span>
              <span className="detail-info-value">
                <HiOutlineLocationMarker style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {resource.location}
              </span>
            </div>

            {resource.building && (
              <div className="detail-info-item">
                <span className="detail-info-label">Building</span>
                <span className="detail-info-value">
                  <HiOutlineOfficeBuilding style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {resource.building}
                </span>
              </div>
            )}

            {resource.floor && (
              <div className="detail-info-item">
                <span className="detail-info-label">Floor</span>
                <span className="detail-info-value">{resource.floor}</span>
              </div>
            )}

            {resource.capacity && (
              <div className="detail-info-item">
                <span className="detail-info-label">Capacity</span>
                <span className="detail-info-value">
                  <HiOutlineUsers style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {resource.capacity} seats
                </span>
              </div>
            )}

            {resource.availableFrom && resource.availableTo && (
              <div className="detail-info-item">
                <span className="detail-info-label">Availability Window</span>
                <span className="detail-info-value">
                  <HiOutlineClock style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  {resource.availableFrom} – {resource.availableTo}
                </span>
              </div>
            )}

            <div className="detail-info-item">
              <span className="detail-info-label">Created</span>
              <span className="detail-info-value" style={{ fontSize: 14 }}>
                {formatDateTime(resource.createdAt)}
              </span>
            </div>

            <div className="detail-info-item">
              <span className="detail-info-label">Last Updated</span>
              <span className="detail-info-value" style={{ fontSize: 14 }}>
                {formatDateTime(resource.updatedAt)}
              </span>
            </div>
          </div>

          <div className="detail-actions">
            <Link to={`/resources/${resource.id}/edit`} className="btn btn-primary">
              <HiOutlinePencil /> Edit Resource
            </Link>
            <button className="btn btn-danger" onClick={() => setDeleteModal(true)}>
              <HiOutlineTrash /> Delete Resource
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Resource</h3>
            <p className="modal-body">
              Are you sure you want to delete <strong>"{resource.name}"</strong>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <HiOutlineTrash /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
