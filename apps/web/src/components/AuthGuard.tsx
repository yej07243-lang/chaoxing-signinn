import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAppState();
  const location = useLocation();

  if (!session) {
    return <Navigate to='/login' replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
