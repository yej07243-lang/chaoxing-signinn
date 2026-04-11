import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useAppState = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppProvider');
  }

  return context;
};
