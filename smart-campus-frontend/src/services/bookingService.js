import axios from 'axios';

const API_BASE_URL = 'http://localhost:8083/api/bookings';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Booking API Service
 * Handles all HTTP communication with the Spring Boot backend for booking operations
 */
const bookingService = {
  // GET all bookings
  getAllBookings: async () => {
    const response = await api.get('');
    return response.data;
  },

  // GET booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // POST create new booking
  createBooking: async (bookingData) => {
    const response = await api.post('', bookingData);
    return response.data;
  },

  // PUT update booking
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/${id}`, bookingData);
    return response.data;
  },

  // DELETE booking
  deleteBooking: async (id) => {
    await api.delete(`/${id}`);
  },

  // GET bookings by resource ID
  getBookingsByResourceId: async (resourceId) => {
    const response = await api.get(`/resource/${resourceId}`);
    return response.data;
  },

  // GET bookings by user ID
  getBookingsByUserId: async (userId) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  },

  // GET bookings by status
  getBookingsByStatus: async (status) => {
    const response = await api.get(`/status/${status}`);
    return response.data;
  },

  // PATCH update booking status
  updateBookingStatus: async (id, status) => {
    const response = await api.patch(`/${id}/status`, status);
    return response.data;
  },

  // GET check resource availability
  checkResourceAvailability: async (resourceId, startTime, endTime, excludeBookingId = null) => {
    const params = {
      resourceId,
      startTime,
      endTime,
    };
    if (excludeBookingId) {
      params.excludeBookingId = excludeBookingId;
    }
    const response = await api.get('/availability', { params });
    return response.data;
  },

  // GET bookings in time range
  getBookingsInTimeRange: async (resourceId, startTime, endTime) => {
    const params = {
      resourceId,
      startTime,
      endTime,
    };
    const response = await api.get('/timerange', { params });
    return response.data;
  },

  // GET upcoming bookings for user
  getUpcomingBookings: async (userId) => {
    const response = await api.get(`/user/${userId}/upcoming`);
    return response.data;
  },

  // GET past bookings for user
  getPastBookings: async (userId) => {
    const response = await api.get(`/user/${userId}/past`);
    return response.data;
  },
};

export default bookingService;
