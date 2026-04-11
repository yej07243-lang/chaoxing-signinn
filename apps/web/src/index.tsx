import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { AuthGuard } from './components/AuthGuard';
import { CoursesPage } from './pages/CoursesPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { LogsPage } from './pages/LogsPage';
import { SettingsPage } from './pages/SettingsPage';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <AppProvider>
      <Routes>
        <Route element={<App />}>
          <Route path='/login' element={<LoginPage />} />
          <Route
            element={
              <AuthGuard>
                <AppShell />
              </AuthGuard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path='/courses' element={<CoursesPage />} />
            <Route path='/logs' element={<LogsPage />} />
            <Route path='/settings' element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </AppProvider>
  </BrowserRouter>
);
