import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Lab from './pages/Lab';
import Test from './pages/Test';
import { isExhausted, getRemainingMs, resetAll } from './lib/timer';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Debug: Log route changes
  useEffect(() => {
    console.log('[App] Route changed to:', location.pathname);
  }, [location]);
  
  // Check session status on route change
  useEffect(() => {
    console.log('[App] Path changed to:', location.pathname);
    
    // Skip session check for test route
    if (location.pathname === '/test') {
      setSessionChecked(true);
      return;
    }
    
    // Force reset session if coming from exit
    if (location.state?.fromExit) {
      console.log('[App] Handling exit flow, forcing session reset');
      resetAll();
      window.history.replaceState({}, document.title);
      setSessionChecked(true);
      return;
    }
    
    // Normal session check
    const checkSession = () => {
      const remaining = getRemainingMs();
      const isSessionValid = !isExhausted() && remaining > 0;
      
      console.log('[App] Session status:', {
        isExhausted: isExhausted(),
        remainingMs: remaining,
        isValid: isSessionValid,
        currentPath: location.pathname
      });

      // If trying to access /lab without valid session, redirect to login
      if (location.pathname === '/lab' && !isSessionValid) {
        console.log('[App] No valid session, redirecting to login');
        navigate('/', { replace: true });
      }

      // If on login page with valid session, redirect to lab
      if (location.pathname === '/' && isSessionValid) {
        console.log('[App] Valid session found, redirecting to lab');
        navigate('/lab', { replace: true });
      }

      setSessionChecked(true);
    };

    checkSession();
  }, [location.pathname, navigate, location.state]);

  // Show loading state while checking session
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/lab" 
          element={
            !isExhausted() && getRemainingMs() > 0 ? 
            <Lab /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route path="/test" element={<Test />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;