import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Lab from './pages/Lab';
import { isExhausted, getRemainingMs, resetAll } from './lib/timer';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Check session status on route change
  useEffect(() => {
    console.log('[App] Path changed to:', location.pathname);
    
    // Force reset session if coming from exit
    if (location.state?.fromExit) {
      console.log('[App] Handling exit flow, forcing session reset');
      resetAll();
      window.history.replaceState({}, document.title); // Clear the state
      setSessionChecked(true);
      return;
    }
    
    // Normal session check
    const checkSession = () => {
      const remaining = getRemainingMs();
      const isSessionValid = !isExhausted() && remaining > 0;
      
      console.log('[App] Session status:', {
        path: location.pathname,
        isExhausted: isExhausted(),
        remainingMs: remaining,
        hasActiveSession: isSessionValid
      });
      
      // If trying to access lab without valid session, redirect to login
      if (location.pathname === '/lab' && !isSessionValid) {
        console.log('[App] No valid session, redirecting to login');
        navigate('/', { replace: true });
      }
      
      setSessionChecked(true);
    };
    
    checkSession();
  }, [location.pathname, navigate, location.state]);

  // Show loading state while checking session
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Checking session...</p>
        </div>
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
            isExhausted() ? (
              <Navigate to="/" replace />
            ) : (
              <Lab />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;