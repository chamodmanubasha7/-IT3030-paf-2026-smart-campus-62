import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  HiOutlineSearch, 
  HiOutlineLocationMarker, 
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlusCircle,
  HiOutlineCube,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineXCircle
} from 'react-icons/hi';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';

/**
 * Displays the resource catalogue with search, filter, and CRUD actions.
 */
export default function ResourceList() {
  const { type: filterType } = useParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });

  useEffect(() => {
    fetchResources();
  }, [filterType]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      let data;
      if (filterType) {
        data = await resourceService.getResourcesByType(filterType);
      } else {
        data = await resourceService.getAllResources();
      }
      setResources(data);
    } catch (error) {
      toast.error('Failed to load resources');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchResources();
      return;
    }
    try {
      setLoading(true);
      const data = await resourceService.searchResources(searchTerm);
      setResources(data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDelete = async () => {
    try {
      await resourceService.deleteResource(deleteModal.id);
      toast.success(`"${deleteModal.name}" deleted successfully`);
      setDeleteModal({ show: false, id: null, name: '' });
      fetchResources();
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      LECTURE_HALL: '🏫',
      LAB: '🔬',
      MEETING_ROOM: '🏢',
      PROJECTOR: '📽️'
    };
    return icons[type] || '📦';
  };

  const getStatusClass = (status) => {
    const classes = {
      AVAILABLE: 'active',
      UNAVAILABLE: 'out-of-service',
      MAINTENANCE: 'under-maintenance',
      OCCUPIED: 'out-of-service'
    };
    return classes[status] || '';
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ') || '';
  };

  const formatType = (type) => {
    return type?.replace(/_/g, ' ') || '';
  };

  // Client-side filtering
  const filteredResources = resources.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    return true;
  });

  // Stats
  const totalCount = resources.length;
  const activeCount = resources.filter(r => r.status === 'AVAILABLE').length;
  const maintenanceCount = resources.filter(r => r.status === 'MAINTENANCE').length;
  const outOfServiceCount = resources.filter(r => r.status === 'UNAVAILABLE' || r.status === 'OCCUPIED').length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>{filterType ? formatType(filterType) + 's' : 'Facilities & Assets Catalogue'}</h2>
        <p>{filterType ? `Browse ${formatType(filterType).toLowerCase()} resources` : 'Manage all campus resources, rooms, and equipment'}</p>
      </div>

      {/* Stats */}
      {!filterType && (
        <div className="stats-grid">
          <div className="stat-card indigo">
            <div className="stat-card-header">
              <div className="stat-card-icon"><HiOutlineCube /></div>
            </div>
            <div className="stat-card-value">{totalCount}</div>
            <div className="stat-card-label">Total Resources</div>
          </div>
          <div className="stat-card green">
            <div className="stat-card-header">
              <div className="stat-card-icon"><HiOutlineCheckCircle /></div>
            </div>
            <div className="stat-card-value">{activeCount}</div>
            <div className="stat-card-label">Available</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-card-header">
              <div className="stat-card-icon"><HiOutlineExclamation /></div>
            </div>
            <div className="stat-card-value">{maintenanceCount}</div>
            <div className="stat-card-label">Under Maintenance</div>
          </div>
          <div className="stat-card red">
            <div className="stat-card-header">
              <div className="stat-card-icon"><HiOutlineXCircle /></div>
            </div>
            <div className="stat-card-value">{outOfServiceCount}</div>
            <div className="stat-card-label">Out of Service</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search resources by name, location, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        {!filterType && (
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="LECTURE_HALL">Lecture Halls</option>
            <option value="LAB">Labs</option>
            <option value="MEETING_ROOM">Meeting Rooms</option>
            <option value="PROJECTOR">Projectors</option>
          </select>
        )}

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="UNAVAILABLE">Unavailable</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="OCCUPIED">Occupied</option>
        </select>

        <Link to="/resources/new" className="btn btn-primary">
          <HiOutlinePlusCircle /> Add Resource
        </Link>
      </div>

      {/* Resource Grid */}
      {filteredResources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No Resources Found</h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search terms or filters.'
              : 'Get started by adding your first campus resource.'}
          </p>
          {!searchTerm && (
            <Link to="/resources/new" className="btn btn-primary">
              <HiOutlinePlusCircle /> Add First Resource
            </Link>
          )}
        </div>
      ) : (
        <div className="resource-grid">
          {filteredResources.map((resource) => (
            <div className="resource-card" key={resource.id}>
              {resource.imageUrl ? (
                <img src={resource.imageUrl} alt={resource.name} className="resource-card-image" />
              ) : (
                <div className="resource-card-placeholder">
                  {getTypeIcon(resource.type)}
                </div>
              )}

              <div className="resource-card-body">
                <div className="resource-card-header">
                  <h3 className="resource-card-title">{resource.name}</h3>
                  <span className={`status-badge ${getStatusClass(resource.status)}`}>
                    {formatStatus(resource.status)}
                  </span>
                </div>

                {resource.description && (
                  <p className="resource-card-desc">{resource.description}</p>
                )}

                <div className="resource-card-meta">
                  <div className="resource-card-meta-item">
                    <HiOutlineCube />
                    <span className="type-badge">{formatType(resource.type)}</span>
                  </div>
                  <div className="resource-card-meta-item">
                    <HiOutlineLocationMarker />
                    <span>{resource.location}{resource.building ? ` • ${resource.building}` : ''}</span>
                  </div>
                  {resource.capacity && (
                    <div className="resource-card-meta-item">
                      <HiOutlineUsers />
                      <span>Capacity: {resource.capacity}</span>
                    </div>
                  )}
                  {resource.availableFrom && resource.availableTo && (
                    <div className="resource-card-meta-item">
                      <HiOutlineClock />
                      <span>{resource.availableFrom} – {resource.availableTo}</span>
                    </div>
                  )}
                </div>

                <div className="resource-card-footer">
                  <Link to={`/resources/${resource.id}`} className="btn btn-secondary btn-sm">
                    <HiOutlineEye /> View
                  </Link>
                  <div className="resource-card-actions">
                    <Link to={`/resources/${resource.id}/edit`} className="btn-icon" title="Edit">
                      <HiOutlinePencil />
                    </Link>
                    <button
                      className="btn-icon"
                      title="Delete"
                      onClick={() => setDeleteModal({ show: true, id: resource.id, name: resource.name })}
                      style={{ color: 'var(--accent-red)' }}
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, id: null, name: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Resource</h3>
            <p className="modal-body">
              Are you sure you want to delete <strong>"{deleteModal.name}"</strong>? 
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
              >
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
