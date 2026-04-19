import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineSparkles,
  HiOutlineLightningBolt,
  HiOutlineInformationCircle,
  HiOutlineLocationMarker,
  HiOutlineChip,
  HiOutlineStar
} from 'react-icons/hi';
import bookingService from '../services/bookingService';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';

/**
 * Form for creating and editing bookings with enhanced UI
 */
export default function BookingForm() {
  const { id, resourceId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    resourceId: resourceId || '',
    userId: '',
    userName: '',
    userEmail: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  
  const [errors, setErrors] = useState({});
  const [availabilityCheck, setAvailabilityCheck] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    loadResources();
    if (isEditing) {
      loadBooking();
    }
  }, [id, isEditing]);

  const loadResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (error) {
      toast.error('Failed to load resources');
    }
  };

  const loadBooking = async () => {
    try {
      setLoading(true);
      const booking = await bookingService.getBookingById(id);
      setFormData({
        resourceId: booking.resource.id,
        userId: booking.userId,
        userName: booking.userName,
        userEmail: booking.userEmail,
        startTime: new Date(booking.startTime).toISOString().slice(0, 16),
        endTime: new Date(booking.endTime).toISOString().slice(0, 16),
        purpose: booking.purpose || ''
      });
    } catch (error) {
      toast.error('Failed to load booking');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const fields = ['resourceId', 'userId', 'userName', 'userEmail', 'startTime', 'endTime', 'purpose'];
    const completed = fields.filter(field => formData[field]).length;
    return Math.round((completed / fields.length) * 100);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.resourceId) newErrors.resourceId = 'Resource is required';
    if (!formData.userId) newErrors.userId = 'User ID is required';
    if (!formData.userName) newErrors.userName = 'User name is required';
    if (!formData.userEmail) {
      newErrors.userEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.userEmail)) {
      newErrors.userEmail = 'Email is invalid';
    }
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
      
      if (start <= new Date()) {
        newErrors.startTime = 'Start time must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAvailability = async () => {
    if (!formData.resourceId || !formData.startTime || !formData.endTime) {
      return;
    }

    try {
      const isAvailable = await bookingService.checkResourceAvailability(
        formData.resourceId,
        formData.startTime,
        formData.endTime,
        id
      );
      setAvailabilityCheck(isAvailable);
    } catch (error) {
      setAvailabilityCheck(null);
    }
  };

  useEffect(() => {
    if (formData.resourceId && formData.startTime && formData.endTime) {
      checkAvailability();
    }
  }, [formData.resourceId, formData.startTime, formData.endTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (availabilityCheck === false) {
      toast.error('Resource is not available for the selected time slot');
      return;
    }

    try {
      setLoading(true);
      
      const bookingData = {
        ...formData,
        resource: { id: formData.resourceId }
      };

      if (isEditing) {
        await bookingService.updateBooking(id, bookingData);
        toast.success('Booking updated successfully');
      } else {
        await bookingService.createBooking(bookingData);
        toast.success('Booking created successfully');
      }
      
      navigate('/bookings');
    } catch (error) {
      toast.error(isEditing ? 'Failed to update booking' : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getFieldStatus = (fieldName) => {
    if (touched[fieldName] && errors[fieldName]) return 'error';
    if (touched[fieldName] && formData[fieldName]) return 'success';
    return 'default';
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progress = calculateProgress();
  const selectedResource = resources.find(r => r.id === formData.resourceId);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/bookings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <HiOutlineArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-md">
                  <HiOutlineCalendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Edit Booking' : 'Create New Booking'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isEditing ? 'Update booking details' : 'Book a campus resource'}
                  </p>
                </div>
              </div>
            </div>
            {/* Progress Indicator */}
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Resource Info Card */}
        {selectedResource && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <HiOutlineSparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedResource.name}</h3>
                  <p className="text-blue-100 flex items-center mt-1">
                    <HiOutlineLocationMarker className="w-4 h-4 mr-1" />
                    {selectedResource.location}
                  </p>
                  <p className="text-blue-100 text-sm mt-2">{selectedResource.description || 'No description available'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                  <HiOutlineChip className="w-4 h-4" />
                  <span className="text-sm font-medium">{selectedResource.type}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                  <HiOutlineStar className="w-4 h-4" />
                  <span className="text-sm font-medium">Capacity: {selectedResource.capacity || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 space-y-8">
          {/* Resource Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <HiOutlineSparkles className="w-4 h-4 mr-2 text-purple-500" />
              Resource *
            </label>
            <select
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                getFieldStatus('resourceId') === 'error' ? 'border-red-500 bg-red-50' : 
                getFieldStatus('resourceId') === 'success' ? 'border-green-500 bg-green-50' : 
                'border-gray-200'
              }`}
            >
              <option value="">Select a resource</option>
              {resources.map(resource => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} - {resource.location}
                </option>
              ))}
            </select>
            {errors.resourceId && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <HiOutlineExclamation className="w-4 h-4 mr-1" />
                {errors.resourceId}
              </p>
            )}
          </div>

          {/* User Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <HiOutlineUser className="w-4 h-4 mr-2 text-blue-500" />
              User Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">User ID *</label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Enter user ID"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                    getFieldStatus('userId') === 'error' ? 'border-red-500 bg-red-50' : 
                    getFieldStatus('userId') === 'success' ? 'border-green-500 bg-green-50' : 
                    'border-gray-200'
                  }`}
                />
                {errors.userId && (
                  <p className="text-red-500 text-sm flex items-center">
                    <HiOutlineExclamation className="w-4 h-4 mr-1" />
                    {errors.userId}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">User Name *</label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                    getFieldStatus('userName') === 'error' ? 'border-red-500 bg-red-50' : 
                    getFieldStatus('userName') === 'success' ? 'border-green-500 bg-green-50' : 
                    'border-gray-200'
                  }`}
                />
                {errors.userName && (
                  <p className="text-red-500 text-sm flex items-center">
                    <HiOutlineExclamation className="w-4 h-4 mr-1" />
                    {errors.userName}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Email *</label>
              <input
                type="email"
                name="userEmail"
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="user@example.com"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                  getFieldStatus('userEmail') === 'error' ? 'border-red-500 bg-red-50' : 
                  getFieldStatus('userEmail') === 'success' ? 'border-green-500 bg-green-50' : 
                  'border-gray-200'
                }`}
              />
              {errors.userEmail && (
                <p className="text-red-500 text-sm flex items-center">
                  <HiOutlineExclamation className="w-4 h-4 mr-1" />
                  {errors.userEmail}
                </p>
              )}
            </div>
          </div>

          {/* Booking Time */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <HiOutlineClock className="w-4 h-4 mr-2 text-purple-500" />
              Booking Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Start Time *</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white ${
                    getFieldStatus('startTime') === 'error' ? 'border-red-500 bg-red-50' : 
                    getFieldStatus('startTime') === 'success' ? 'border-green-500 bg-green-50' : 
                    'border-gray-200'
                  }`}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm flex items-center">
                    <HiOutlineExclamation className="w-4 h-4 mr-1" />
                    {errors.startTime}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">End Time *</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white ${
                    getFieldStatus('endTime') === 'error' ? 'border-red-500 bg-red-50' : 
                    getFieldStatus('endTime') === 'success' ? 'border-green-500 bg-green-50' : 
                    'border-gray-200'
                  }`}
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm flex items-center">
                    <HiOutlineExclamation className="w-4 h-4 mr-1" />
                    {errors.endTime}
                  </p>
                )}
              </div>
            </div>
            {/* Availability Check */}
            {availabilityCheck !== null && (
              <div className={`flex items-center p-4 rounded-xl ${
                availabilityCheck ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
              }`}>
                {availabilityCheck ? (
                  <HiOutlineCheckCircle className="w-5 h-5 text-green-600 mr-3" />
                ) : (
                  <HiOutlineExclamation className="w-5 h-5 text-red-600 mr-3" />
                )}
                <span className={`text-sm font-medium ${availabilityCheck ? 'text-green-700' : 'text-red-700'}`}>
                  {availabilityCheck ? 'Resource is available for this time slot' : 'Resource is not available for this time slot'}
                </span>
              </div>
            )}
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <HiOutlineDocumentText className="w-4 h-4 mr-2 text-purple-500" />
              Purpose
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Describe the purpose of this booking (optional)"
              rows="3"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none ${
                getFieldStatus('purpose') === 'error' ? 'border-red-500 bg-red-50' : 
                getFieldStatus('purpose') === 'success' ? 'border-green-500 bg-green-50' : 
                'border-gray-200'
              }`}
            />
            <p className="text-gray-400 text-sm flex items-center">
              <HiOutlineInformationCircle className="w-4 h-4 mr-1" />
              Optional - helps us understand your booking needs
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || availabilityCheck === false}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <HiOutlineLightningBolt className="w-5 h-5 mr-2" />
                  {isEditing ? 'Update Booking' : 'Create Booking'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
