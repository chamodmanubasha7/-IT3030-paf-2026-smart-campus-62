/**
 * Validation utility for the Smart Campus Operations Hub
 */

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateContactNumber = (number) => {
  // Matches +94771234567, 0771234567, etc.
  const re = /^(?:\+94|0)?7[0-9]{8}$/;
  return re.test(number);
};

export const validateRequired = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export const validateStudentId = (id) => {
  // Example: IT21004567
  const re = /^[A-Z]{2}[0-9]{8}$/;
  return re.test(id);
};

export const validateStaffId = (id) => {
  // Example: STF-8829
  const re = /^[A-Z]{3}-[0-9]{4}$/;
  return re.test(id);
};
