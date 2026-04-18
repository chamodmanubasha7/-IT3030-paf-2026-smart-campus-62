import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineSave } from 'react-icons/hi';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';

/**
 * Form component for creating and editing resources.
 */
export default function ResourceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    description: '',
    capacity: '',
    location: '',
    building: '',
    floor: '',
    status: 'ACTIVE',
    availableFrom: '',
    availableTo: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      loadResource();
    }
  }, [id]);

  const loadResource = async () => {
    try {
      setFetching(true);
      const data = await resourceService.getResourceById(id);
      setFormData({
        name: data.name || '',
        type: data.type || 'LECTURE_HALL',
        description: data.description || '',
        capacity: data.capacity || '',
        location: data.location || '',
        building: data.building || '',
        floor: data.floor || '',
        status: data.status || 'ACTIVE',
        availableFrom: data.availableFrom || '',
        availableTo: data.availableTo || '',
        imageUrl: data.imageUrl || '',
      });
    } catch (error) {
      toast.error('Failed to load resource');
      navigate('/');
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.name.length > 100) newErrors.name = 'Name must be under 100 characters';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.capacity && formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    if (formData.availableFrom && formData.availableTo && formData.availableFrom >= formData.availableTo) {
      newErrors.availableTo = 'Must be after the start time';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      availableFrom: formData.availableFrom || null,
      availableTo: formData.availableTo || null,
      imageUrl: formData.imageUrl || null,
      building: formData.building || null,
      floor: formData.floor || null,
      description: formData.description || null,
    };

    try {
      setLoading(true);
      if (isEditMode) {
        await resourceService.updateResource(id, payload);
        toast.success('Resource updated successfully!');
      } else {
        await resourceService.createResource(payload);
        toast.success('Resource created successfully!');
      }
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      const fieldErrors = error.response?.data?.errors;
      if (fieldErrors) {
        setErrors(fieldErrors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="page-header">
        <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}>
          <HiOutlineArrowLeft /> Back to Catalogue
        </Link>
        <h2>{isEditMode ? 'Edit Resource' : 'Add New Resource'}</h2>
        <p>{isEditMode ? 'Update the resource details below' : 'Fill in the details to add a new campus resource'}</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Name */}
            <div className="form-group">
              <label>Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Main Lecture Hall A"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Type */}
            <div className="form-group">
              <label>Type <span className="required">*</span></label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="PROJECTOR">Projector</option>
                <option value="CAMERA">Camera</option>
                <option value="WHITEBOARD">Whiteboard</option>
                <option value="COMPUTER">Computer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label>Location <span className="required">*</span></label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Block A, Room 301"
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>

            {/* Building */}
            <div className="form-group">
              <label>Building</label>
              <input
                type="text"
                name="building"
                value={formData.building}
                onChange={handleChange}
                placeholder="e.g., Engineering Building"
              />
            </div>

            {/* Floor */}
            <div className="form-group">
              <label>Floor</label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                placeholder="e.g., 3rd Floor"
              />
            </div>

            {/* Capacity */}
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="e.g., 120"
                min="1"
              />
              {errors.capacity && <span className="error-text">{errors.capacity}</span>}
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              </select>
            </div>

            {/* Image URL */}
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Available From */}
            <div className="form-group">
              <label>Available From</label>
              <input
                type="time"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
              />
            </div>

            {/* Available To */}
            <div className="form-group">
              <label>Available To</label>
              <input
                type="time"
                name="availableTo"
                value={formData.availableTo}
                onChange={handleChange}
              />
              {errors.availableTo && <span className="error-text">{errors.availableTo}</span>}
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the resource, its features, available equipment, etc."
                rows={4}
              />
            </div>
          </div>

          <div className="form-actions">
            <Link to="/" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <HiOutlineSave />
              {loading ? 'Saving...' : isEditMode ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
