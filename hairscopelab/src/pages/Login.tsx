import React, { FormEvent, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkPassword, validateCredentials } from '../lib/auth';
import { getRemainingMs, isExhausted, setDeadlineOnce } from '../lib/timer';
import LockAnimation from '../components/LockAnimation';
import SlidingDoors from '../components/SlidingDoors';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login: React.FC = () => {
  console.log('Login component rendering...');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRestriction, setShowRestriction] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showDoors, setShowDoors] = useState(false);
  const navigate = useNavigate();

  // Memoize the auth success handler
  const handleAuthSuccess = useCallback(() => {
    console.log('[DEBUG] handleAuthSuccess called');
    setShowLock(true);
    
    // After lock animation, show sliding doors
    const timer = setTimeout(() => {
      console.log('[DEBUG] Showing sliding doors');
      setShowLock(false);
      setShowDoors(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Session check on mount
  useEffect(() => {
    console.log('[DEBUG] Login mounted, checking session...');
    const isSessionExhausted = isExhausted();
    console.log('[DEBUG] isExhausted:', isSessionExhausted);
    setShowRestriction(isSessionExhausted);
  }, []); // Empty dependency array to run only once on mount

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('[DEBUG] Form submitted');
    
    if (!username || !password) {
      console.log('[DEBUG] Validation failed: Missing credentials');
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    console.log('[DEBUG] Starting authentication...');
    
    try {
      console.log('[DEBUG] Validating credentials...');
      const isValid = await checkPassword(username, password);
      console.log('[DEBUG] Authentication result:', isValid);
      
      if (!isValid) {
        console.log('[DEBUG] Invalid credentials');
        setError('Invalid username or password');
        setIsLoading(false);
        return;
      }
      
      console.log('[DEBUG] Authentication successful');
      handleAuthSuccess();
      
    } catch (err) {
      console.error('[ERROR] Login error:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDoorsAnimationComplete = useCallback(() => {
    console.log('[DEBUG] handleDoorsAnimationComplete called');
    try {
      console.log('[DEBUG] Setting deadline...');
      setDeadlineOnce();
      
      // Add a small delay to ensure the animation completes before navigation
      setTimeout(() => {
        console.log('[DEBUG] Navigating to /lab');
        navigate('/lab', { replace: true });
      }, 100);
      
    } catch (err) {
      console.error('[ERROR] Error in handleDoorsAnimationComplete:', err);
    }
  }, [navigate]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Debug effect to track state changes
  useEffect(() => {
    console.log('[DEBUG] State update:', {
      showLock,
      showDoors,
      isLoading,
      showRestriction,
      hasError: !!error
    });
  }, [showLock, showDoors, isLoading, showRestriction, error]);

  if (showRestriction) {
    console.log('[DEBUG] Showing restriction message');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h2>
          <p className="text-gray-700 mb-6">
            Your session has expired. Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  console.log('[DEBUG] Rendering login form');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Lock Animation */}
      {showLock && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-90">
          <LockAnimation 
            playing={true}
            size={80}
            onComplete={() => {
              setShowLock(false);
              setShowDoors(true);
            }}
          />
        </div>
      )}
      
      {/* Sliding Doors */}
      <SlidingDoors 
        isOpen={showDoors}
        onAnimationComplete={handleDoorsAnimationComplete}
      />
      
      {/* Login Form */}
      {!showLock && !showDoors && (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">HairScope Lab</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1} // Prevent focusing on the button
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default React.memo(Login);