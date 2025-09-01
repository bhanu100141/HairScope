import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { isValidSession, getSessionStatus, resetAll } from './lib/timer';
import Login from './pages/Login';
import Lab from './pages/Lab';
import Test from './pages/Test';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session state on app load
  useEffect(() => {
    console.log('[App] Initializing session state');
    setIsInitialized(true);
  }, []);

  // Handle route changes and session validation
  useEffect(() => {
    if (!isInitialized) return;

    console.log(`[App] Route changed to: ${location.pathname}`);
    console.log(`[App] Path changed to: ${location.pathname}`);

    // Skip session check for login page
    if (location.pathname === '/') {
      return;
    }

    // Check session validity for protected routes
    const sessionStatus = getSessionStatus();
    console.log('[App] Session status:', { ...sessionStatus, currentPath: location.pathname });

    if (!sessionStatus.isValid) {
      console.log('[App] No valid session, redirecting to login');
      resetAll();
      navigate('/', { replace: true });
    }
  }, [location.pathname, isInitialized, navigate]);

  if (!isInitialized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/lab" element={<Lab />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </div>
  );
}

export default App;