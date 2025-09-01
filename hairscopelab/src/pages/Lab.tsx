import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRemainingMs, endSession, resetAll, isValidSession } from '../lib/timer';

const Lab: React.FC = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>('10:00');
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(Date.now());

  // Memoized function to update the timer display
  const updateTimeDisplay = useCallback((remainingMs: number) => {
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }, []);

  // Check session status
  const checkSession = useCallback(() => {
    if (!isValidSession()) {
      console.log('Session is no longer valid, redirecting to login');
      endSession();
      setIsExpired(true);
      navigate('/', { replace: true });
      return false;
    }

    const remainingMs = getRemainingMs();
    const now = Date.now();
    
    // Only update if at least 500ms have passed since last update
    if (now - lastUpdateTime.current >= 500) {
      updateTimeDisplay(remainingMs);
      lastUpdateTime.current = now;
    }

    if (remainingMs <= 0) {
      console.log('Session expired, ending session');
      endSession();
      setIsExpired(true);
      navigate('/', { replace: true });
      return false;
    }
    
    return true;
  }, [navigate, updateTimeDisplay]);

  // Set up timer interval
  useEffect(() => {
    console.log('Lab component mounted, checking session...');
    
    // Initial check
    if (!isValidSession()) {
      console.log('No valid session, redirecting to login');
      endSession();
      navigate('/', { replace: true });
      return;
    }
    
    // Initial time display
    updateTimeDisplay(getRemainingMs());
    
    // Set up interval for timer updates (every 500ms)
    timerRef.current = window.setInterval(checkSession, 500);
    
    // Clean up interval on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [checkSession, navigate, updateTimeDisplay]);

  const handleExit = useCallback(() => {
    console.log('User clicked exit, resetting session');
    
    // Clear the interval immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clear all session data
    endSession();
    
    // Force a full page reload to ensure clean state
    window.location.href = '/';
  }, []);

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Session Expired</h2>
          <p className="mb-4">Your session has ended. Please log in again to continue.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">HairScope Lab</h1>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-medium text-gray-700">
              Time Remaining: <span className="font-bold">{timeLeft}</span>
            </div>
            <button
              onClick={handleExit}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Exit Lab
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Lab Content</h2>
          <p className="text-gray-700">
            Welcome to the HairScope Lab. Your session will expire in {timeLeft} minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Lab);