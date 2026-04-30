import { createContext, useContext, useState, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);
const normalizeRole = (role) => String(role || 'USER').replace(/^ROLE_/, '');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const id = parsed.userId ?? parsed.id;
    return {
      ...parsed,
      ...(id != null ? { id: String(id) } : {}),
      role: normalizeRole(parsed.role),
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const saveSession = useCallback((data) => {
    const normalizedRole = normalizeRole(data.role);
    const id = data.userId ?? data.id;
    const userPayload = {
      name: data.name,
      email: data.email,
      profileImageUrl: data.profileImageUrl ?? null,
      role: normalizedRole,
      ...(id != null ? { id: String(id) } : {}),
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userPayload));
    setToken(data.token);
    setUser(userPayload);
  }, []);

  const syncSessionUser = useCallback((data) => {
    const normalizedRole = normalizeRole(data.role);
    const stored = localStorage.getItem('user');
    const parsed = stored ? JSON.parse(stored) : {};
    const id = data.userId ?? data.id ?? parsed.id;
    const userPayload = {
      name: data.name,
      email: data.email,
      profileImageUrl: data.profileImageUrl ?? parsed.profileImageUrl ?? null,
      role: normalizedRole,
      ...(id != null ? { id: String(id) } : {}),
    };
    localStorage.setItem('user', JSON.stringify(userPayload));
    setUser(userPayload);
  }, []);

  const register = useCallback(async (name, email, password, contactNo, academicYear, semester, role, adminPasscode) => {
    const res = await api.post('/api/auth/register', { name, email, password, contactNo, academicYear, semester, role, adminPasscode });
    saveSession(res.data);
    return res.data;
  }, [saveSession]);

  const registerWithInvite = useCallback(async (token, name, email, password, contactNo, academicYear, semester) => {
    const res = await api.post('/api/auth/register-invite', { token, name, email, password, contactNo, academicYear, semester });
    saveSession(res.data);
    return res.data;
  }, [saveSession]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    saveSession(res.data);
    return res.data;
  }, [saveSession]);

  const loginWithGoogle = useCallback(async (idToken) => {
    const res = await api.post('/api/auth/google', { idToken });
    saveSession(res.data);
    return res.data;
  }, [saveSession]);

  const updateProfile = useCallback(async (name, profileImageUrl) => {
    const res = await api.put('/api/auth/me', { name, profileImageUrl });
    saveSession(res.data);
    return res.data;
  }, [saveSession]);

  const uploadProfileImage = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/api/auth/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    saveSession(res.data);
    return res.data;
  }, [saveSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, register, registerWithInvite, login, loginWithGoogle, updateProfile, uploadProfileImage, logout, syncSessionUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
