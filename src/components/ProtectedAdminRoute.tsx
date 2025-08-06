import { JSX } from 'react';
import { Navigate } from 'react-router-dom';

const isAdminAuthenticated = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || !role) return false;

  try {
    return role?.toString().toLowerCase() === 'admin';
  } catch {
    return false;
  }
};

const ProtectedAdminRoute = ({ children }: { children: JSX.Element }) => {
  return isAdminAuthenticated() ? children : <Navigate to="/login" />;
};

export default ProtectedAdminRoute;
