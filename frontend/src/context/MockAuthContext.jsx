import React, { createContext, useContext, useState, useEffect } from 'react';

// This is a temporary Mock Auth Context for Module C testing.
// Your friend will replace this with the real OAuth2 logic.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Roles: USER, TECHNICIAN, ADMIN
  const [role, setRole] = useState(localStorage.getItem('mock_role') || 'USER');
  const [userId, setUserId] = useState(localStorage.getItem('mock_userId') || 'user-100');
  const [userName, setUserName] = useState(localStorage.getItem('mock_userName') || 'John Doe');

  useEffect(() => {
    localStorage.setItem('mock_role', role);
    localStorage.setItem('mock_userId', userId);
    localStorage.setItem('mock_userName', userName);
  }, [role, userId, userName]);

  const switchRole = (newRole) => {
    setRole(newRole);
    if (newRole === 'ADMIN') {
      setUserId('admin-999');
      setUserName('Alice Admin');
    } else if (newRole === 'TECHNICIAN') {
      setUserId('tech-500');
      setUserName('Bob Fixer');
    } else {
      setUserId('user-100');
      setUserName('John Doe');
    }
  };

  return (
    <AuthContext.Provider value={{ role, userId, userName, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
