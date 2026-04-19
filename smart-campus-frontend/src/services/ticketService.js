import axios from 'axios';

const API_BASE_URL = 'http://localhost:8083/api/tickets';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Ticket API Service
 * Handles all HTTP communication with the Spring Boot backend for ticket operations
 */
const ticketService = {
  // GET all tickets
  getAllTickets: async () => {
    const response = await api.get('');
    return response.data;
  },

  // GET ticket by ID
  getTicketById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // POST create new ticket
  createTicket: async (ticketData) => {
    const response = await api.post('', ticketData);
    return response.data;
  },

  // PUT update ticket
  updateTicket: async (id, ticketData) => {
    const response = await api.put(`/${id}`, ticketData);
    return response.data;
  },

  // DELETE ticket
  deleteTicket: async (id) => {
    await api.delete(`/${id}`);
  },

  // GET tickets by resource ID
  getTicketsByResourceId: async (resourceId) => {
    const response = await api.get(`/resource/${resourceId}`);
    return response.data;
  },

  // GET tickets by user ID
  getTicketsByUserId: async (userId) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  },

  // GET tickets by status
  getTicketsByStatus: async (status) => {
    const response = await api.get(`/status/${status}`);
    return response.data;
  },

  // GET tickets by assigned to
  getTicketsByAssignedTo: async (assignedTo) => {
    const response = await api.get(`/assigned/${assignedTo}`);
    return response.data;
  },

  // GET tickets by priority
  getTicketsByPriority: async (priority) => {
    const response = await api.get(`/priority/${priority}`);
    return response.data;
  },

  // GET tickets by category
  getTicketsByCategory: async (category) => {
    const response = await api.get(`/category/${category}`);
    return response.data;
  },

  // PATCH update ticket status
  updateTicketStatus: async (id, status) => {
    const response = await api.patch(`/${id}/status`, status);
    return response.data;
  },

  // PATCH assign ticket
  assignTicket: async (id, assignedTo) => {
    const response = await api.patch(`/${id}/assign`, assignedTo);
    return response.data;
  },

  // PATCH resolve ticket
  resolveTicket: async (id) => {
    const response = await api.patch(`/${id}/resolve`);
    return response.data;
  },

  // GET open tickets
  getOpenTickets: async () => {
    const response = await api.get('/open');
    return response.data;
  },

  // GET tickets for assignee
  getTicketsForAssignee: async (assignedTo) => {
    const response = await api.get(`/assignee/${assignedTo}`);
    return response.data;
  },
};

export default ticketService;
