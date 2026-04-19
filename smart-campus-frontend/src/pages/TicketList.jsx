import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlusCircle,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineExclamation,
  HiOutlineCog,
  HiOutlineChatAlt,
  HiOutlineFlag,
  HiOutlineSupport,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineTicket,
  HiOutlineSparkles,
  HiOutlineLightningBolt
} from 'react-icons/hi';
import ticketService from '../services/ticketService';
import resourceService from '../services/resourceService';
import toast from 'react-hot-toast';

/**
 * Displays all tickets with advanced search, filter, statistics, and CRUD actions
 */
export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, details: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchTickets();
    fetchResources();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAllTickets();
      setTickets(data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (error) {
      console.error('Failed to load resources:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await ticketService.deleteTicket(id);
      toast.success('Ticket deleted successfully');
      fetchTickets();
      setDeleteModal({ show: false, id: null, details: '' });
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
        return <HiOutlineExclamation className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <HiOutlineClock className="w-4 h-4" />;
      case 'RESOLVED':
        return <HiOutlineCheckCircle className="w-4 h-4" />;
      case 'CLOSED':
        return <HiOutlineXCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'OPEN').length;
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
    const closed = tickets.filter(t => t.status === 'CLOSED').length;
    const urgent = tickets.filter(t => t.priority === 'URGENT').length;
    return { total, open, inProgress, resolved, closed, urgent };
  };

  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = 
        ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'ALL') {
        const today = new Date();
        const ticketDate = new Date(ticket.createdAt);
        if (dateFilter === 'TODAY') {
          matchesDate = ticketDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'THIS_WEEK') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = ticketDate >= weekAgo && ticketDate <= today;
        } else if (dateFilter === 'THIS_MONTH') {
          matchesDate = ticketDate.getMonth() === today.getMonth() && ticketDate.getFullYear() === today.getFullYear();
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        comparison = new Date(a[sortBy]) - new Date(b[sortBy]);
      } else if (sortBy === 'priority') {
        const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        comparison = (a[sortBy] || '').localeCompare(b[sortBy] || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openDeleteModal = (ticket) => {
    setDeleteModal({
      show: true,
      id: ticket.id,
      details: `${ticket.title} - ${ticket.userName} (${formatDate(ticket.createdAt)})`
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <HiOutlineTicket className="w-8 h-8 mr-3 text-purple-600" />
            Ticket Management
          </h1>
          <p className="text-gray-500 mt-1">Track and manage support tickets and issues</p>
        </div>
        <Link
          to="/tickets/create"
          className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          <HiOutlinePlusCircle className="w-5 h-5 mr-2" />
          Create Ticket
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Tickets</p>
              <p className="text-3xl font-bold mt-1">{stats.total}</p>
            </div>
            <HiOutlineChartBar className="w-10 h-10 text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Open</p>
              <p className="text-3xl font-bold mt-1">{stats.open}</p>
            </div>
            <HiOutlineExclamation className="w-10 h-10 text-yellow-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold mt-1">{stats.inProgress}</p>
            </div>
            <HiOutlineClock className="w-10 h-10 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold mt-1">{stats.resolved}</p>
            </div>
            <HiOutlineCheckCircle className="w-10 h-10 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium">Closed</p>
              <p className="text-3xl font-bold mt-1">{stats.closed}</p>
            </div>
            <HiOutlineXCircle className="w-10 h-10 text-gray-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Urgent</p>
              <p className="text-3xl font-bold mt-1">{stats.urgent}</p>
            </div>
            <HiOutlineLightningBolt className="w-10 h-10 text-red-200" />
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <HiOutlineFilter className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-sm font-semibold text-gray-700">Advanced Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="ISSUE">Issue</option>
            <option value="REQUEST">Request</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="COMPLAINT">Complaint</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
          </select>

          <button
            onClick={fetchTickets}
            className="flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            <HiOutlineRefresh className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
          <div className="flex flex-col items-center">
            <HiOutlineDocumentText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">No tickets found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or create a new ticket</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-white/20 rounded-lg mr-3">
                      <HiOutlineTicket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold truncate max-w-[150px]">{ticket.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border-2 border-white/30 bg-white/20 text-white`}>
                          {ticket.priority}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border-2 border-white/30 bg-white/20 text-white`}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* User Info */}
                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <HiOutlineUser className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-semibold text-gray-900">{ticket.userName}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <HiOutlineMail className="w-3 h-3 mr-1" />
                      {ticket.userEmail}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                </div>

                {/* Category & Resource */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    {getCategoryIcon(ticket.category)}
                    <span className="ml-2 font-medium">Category:</span>
                    <span className="ml-2">{ticket.category}</span>
                  </div>
                  {ticket.resource?.name && (
                    <div className="flex items-center text-sm text-gray-700">
                      <HiOutlineSparkles className="w-4 h-4 text-purple-500 mr-2" />
                      <span className="font-medium">Resource:</span>
                      <span className="ml-2">{ticket.resource.name}</span>
                    </div>
                  )}
                </div>

                {/* Created Date */}
                <div className="flex items-center text-sm text-gray-500">
                  <HiOutlineClock className="w-4 h-4 text-purple-500 mr-2" />
                  <span>Created: {formatDate(ticket.createdAt)}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors"
                      title="View"
                    >
                      <HiOutlineEye className="w-5 h-5" />
                    </Link>
                    <Link
                      to={`/tickets/${ticket.id}/edit`}
                      className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <HiOutlinePencil className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => openDeleteModal(ticket)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <HiOutlineTrash className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Ticket</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this ticket? This action cannot be undone.
              <br />
              <span className="font-semibold text-gray-900 mt-2 block">{deleteModal.details}</span>
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModal({ show: false, id: null, details: '' })}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.id)}
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
