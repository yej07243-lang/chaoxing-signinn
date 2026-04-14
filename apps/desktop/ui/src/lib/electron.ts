import React from 'react';
import { AppContext } from '../App';

export const useDesktopApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useDesktopApp must be used inside AppContext.Provider');
  }
  return context;
};
