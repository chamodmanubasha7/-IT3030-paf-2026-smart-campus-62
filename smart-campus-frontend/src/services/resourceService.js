import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api/resources';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Resource API Service
 * Handles all HTTP communication with the Spring Boot backend
 */
const resourceService = {
  // GET all resources
  getAllResources: async () => {
    const response = await api.get('');
    return response.data;
  },

  // GET resource by ID
  getResourceById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // POST create new resource
  createResource: async (resourceData) => {
    const response = await api.post('', resourceData);
    return response.data;
  },

  // PUT update resource
  updateResource: async (id, resourceData) => {
    const response = await api.put(`/${id}`, resourceData);
    return response.data;
  },

  // PATCH update resource status
  updateResourceStatus: async (id, status) => {
    const response = await api.patch(`/${id}/status`, { status });
    return response.data;
  },

  // DELETE resource
  deleteResource: async (id) => {
    await api.delete(`/${id}`);
  },

  // GET search resources
  searchResources: async (keyword) => {
    const response = await api.get(`/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  // GET resources by type
  getResourcesByType: async (type) => {
    const response = await api.get(`/type/${type}`);
    return response.data;
  },

  // GET resources by status
  getResourcesByStatus: async (status) => {
    const response = await api.get(`/status/${status}`);
    return response.data;
  },

  // GET resources by location
  getResourcesByLocation: async (location) => {
    const response = await api.get(`/location/${encodeURIComponent(location)}`);
    return response.data;
  },
};

export default resourceService;
