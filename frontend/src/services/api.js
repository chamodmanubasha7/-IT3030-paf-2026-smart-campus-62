import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
});

// Interceptor to attach the mock user headers for testing
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('mock_userId') || 'user-100';
  const role = localStorage.getItem('mock_role') || 'USER';
  const userName = localStorage.getItem('mock_userName') || 'John Doe';
  
  config.headers['X-User-Id'] = userId;
  config.headers['X-User-Role'] = role;
  config.headers['X-User-Name'] = userName;
  
  return config;
});

export default api;
