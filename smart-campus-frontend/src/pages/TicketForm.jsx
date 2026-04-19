import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineDocumentText,
  HiOutlineExclamation,
  HiOutlineCog,
  HiOutlineChatAlt,
  HiOutlineSupport,
  HiOutlineFlag,
  HiOutlineUserAdd,
  HiOutlineCheckCircle,
  HiOutlineTicket,
  HiOutlineSparkles,
  HiOutlineLightningBolt,
  HiOutlineInformationCircle,
  HiOutlineLocationMarker,
  HiOutlineChip,
  HiOutlineStar,
  HiOutlineFire
} from 'react-icons/hi';
import ticketService from '../services/ticketService';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';

/**
 * Form for creating and editing tickets with enhanced UI
 */
export default function TicketForm() {
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
    title: '',
    description: '',
    priority: 'MEDIUM',
    category: 'ISSUE',
    assignedTo: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    loadResources();
    if (isEditing) {
      loadTicket();
    }
  }, [id, resourceId, isEditing]);

  const loadResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (error) {
      toast.error('Failed to load resources');
    }
  };

  const loadTicket = async () => {
    try {
      setLoading(true);
      const ticket = await ticketService.getTicketById(id);
      setFormData({
        resourceId: ticket.resource?.id || '',
        userId: ticket.userId,
        userName: ticket.userName,
        userEmail: ticket.userEmail,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        category: ticket.category,
        assignedTo: ticket.assignedTo || ''
      });
    } catch (error) {
      toast.error('Failed to load ticket');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const fields = ['userId', 'userName', 'userEmail', 'title', 'description', 'priority', 'category'];
    const completed = fields.filter(field => formData[field]).length;
    return Math.round((completed / fields.length) * 100);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userId) newErrors.userId = 'User ID is required';
    if (!formData.userName) newErrors.userName = 'User name is required';
    if (!formData.userEmail) {
      newErrors.userEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.userEmail)) {
      newErrors.userEmail = 'Email is invalid';
    }
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const ticketData = {
        ...formData,
        resource: formData.resourceId ? { id: formData.resourceId } : null
      };

      if (isEditing) {
        await ticketService.updateTicket(id, ticketData);
        toast.success('Ticket updated successfully');
      } else {
        await ticketService.createTicket(ticketData);
        toast.success('Ticket created successfully');
      }
      
      navigate('/tickets');
    } catch (error) {
      toast.error(isEditing ? 'Failed to update ticket' : 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'MAINTENANCE':
        return <HiOutlineCog className="w-4 h-4" />;
      case 'ISSUE':
        return <HiOutlineExclamation className="w-4 h-4" />;
      case 'REQUEST':
        return <HiOutlineChatAlt className="w-4 h-4" />;
      case 'COMPLAINT':
        return <HiOutlineFlag className="w-4 h-4" />;
      default:
        return <HiOutlineSupport className="w-4 h-4" />;
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                onClick={() => navigate('/tickets')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <HiOutlineArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-md">
                  <HiOutlineTicket className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Edit Ticket' : 'Create New Ticket'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isEditing ? 'Update ticket details' : 'Submit a support ticket'}
                  </p>
                </div>
              </div>
            </div>
            {/* Progress Indicator */}
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-gray-700">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Resource Info Card */}
        {selectedResource && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <HiOutlineSparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedResource.name}</h3>
                  <p className="text-purple-100 flex items-center mt-1">
                    <HiOutlineLocationMarker className="w-4 h-4 mr-1" />
                    {selectedResource.location}
                  </p>
                  <p className="text-purple-100 text-sm mt-2">{selectedResource.description || 'No description available'}</p>
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
          {/* User Information */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <HiOutlineUser className="w-4 h-4 mr-2 text-purple-500" />
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
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white ${
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
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white ${
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
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white ${
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

          {/* Resource Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <HiOutlineSparkles className="w-4 h-4 mr-2 text-purple-500" />
              Resource (Optional)
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
              <option value="">Select a resource (optional)</option>
              {resources.map(resource => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} - {resource.location}
                </option>
              ))}
            </select>
            <p className="text-gray-400 text-sm flex items-center">
              <HiOutlineInformationCircle className="w-4 h-4 mr-1" />
              Optional - select if this ticket is related to a specific resource
            </p>
          </div>

          {/* Ticket Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <HiOutlineTicket className="w-4 h-4 mr-2 text-blue-500" />
              Ticket Details
            </h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief summary of the issue"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
                  getFieldStatus('title') === 'error' ? 'border-red-500 bg-red-50' : 
                  getFieldStatus('title') === 'success' ? 'border-green-500 bg-green-50' : 
                  'border-gray-200'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm flex items-center">
                  <HiOutlineExclamation className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the issue"
                rows="4"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white resize-none ${
                  getFieldStatus('description') === 'error' ? 'border-red-500 bg-red-50' : 
                  getFieldStatus('description') === 'success' ? 'border-green-500 bg-green-50' : 
                  'border-gray-200'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm flex items-center">
                  <HiOutlineExclamation className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Priority & Category */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
              <HiOutlineFire className="w-4 h-4 mr-2 text-orange-500" />
              Priority & Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Priority *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white ${
                    getFieldStatus('priority') === 'error' ? 'border-red-500 bg-red-50' : 
                    getFieldStatus('priority') === 'success' ? 'border-green-500 bg-green-50' : 
                    'border-gray-200'
                  }`}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white ${
                    getFieldStatus('category') === 'error' ? 'border-red-500 bg-red-50' : 
                    getFieldStatus('category') === 'success' ? 'border-green-500 bg-green-50' : 
                    'border-gray-200'
                  }`}
                >
                  <option value="ISSUE">Issue</option>
                  <option value="REQUEST">Request</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="COMPLAINT">Complaint</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <HiOutlineUserAdd className="w-4 h-4 mr-2 text-purple-500" />
              Assigned To (Optional)
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="Assign to staff member"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white ${
                getFieldStatus('assignedTo') === 'error' ? 'border-red-500 bg-red-50' : 
                getFieldStatus('assignedTo') === 'success' ? 'border-green-500 bg-green-50' : 
                'border-gray-200'
              }`}
            />
            <p className="text-gray-400 text-sm flex items-center">
              <HiOutlineInformationCircle className="w-4 h-4 mr-1" />
              Optional - assign this ticket to a specific staff member
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <HiOutlineLightningBolt className="w-5 h-5 mr-2" />
                  {isEditing ? 'Update Ticket' : 'Create Ticket'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
