const STORAGE_KEYS = {
  deadline: 'hs_deadline_ts',
  exhausted: 'hs_exhausted',
  session: 'hs_session'
} as const;

// Allocation in minutes (configure here)
const ALLOCATION_MINUTES = 10;
const SESSION_DURATION = ALLOCATION_MINUTES * 60 * 1000;

export function now() {
  return Date.now();
}

/**
 * Starts a new session if one doesn't exist
 */
export function startSession(): void {
  if (typeof window === 'undefined') return;
  
  const sessionData = {
    startedAt: now(),
    expiresAt: now() + SESSION_DURATION
  };
  
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionData));
  localStorage.removeItem(STORAGE_KEYS.exhausted);
  console.log('New session started');
}

/**
 * Ends the current session
 */
export function endSession(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.session);
  localStorage.setItem(STORAGE_KEYS.exhausted, 'true');
  console.log('Session ended');
}

/**
 * Gets the remaining time in milliseconds
 */
export function getRemainingMs(): number {
  if (typeof window === 'undefined') return SESSION_DURATION;
  
  const sessionData = localStorage.getItem(STORAGE_KEYS.session);
  if (!sessionData) return 0;
  
  try {
    const { expiresAt } = JSON.parse(sessionData);
    const remaining = Math.max(0, expiresAt - now());
    return remaining > 0 ? remaining : 0;
  } catch (e) {
    console.error('Error parsing session data:', e);
    return 0;
  }
}

/**
 * Checks if the session is valid
 */
export function isValidSession(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if explicitly exhausted
  if (localStorage.getItem(STORAGE_KEYS.exhausted) === 'true') {
    console.log('Session is explicitly marked as exhausted');
    return false;
  }
  
  // Check if session exists and is not expired
  const sessionData = localStorage.getItem(STORAGE_KEYS.session);
  if (!sessionData) {
    console.log('No active session found');
    return false;
  }
  
  try {
    const { expiresAt } = JSON.parse(sessionData);
    const isValid = now() < expiresAt;
    if (!isValid) {
      console.log('Session expired');
      endSession();
    }
    return isValid;
  } catch (e) {
    console.error('Error validating session:', e);
    return false;
  }
}

/**
 * Resets all session data
 */
export function resetAll(): void {
  if (typeof window === 'undefined') return;
  
  console.log('Resetting all session data');
  localStorage.removeItem(STORAGE_KEYS.session);
  localStorage.removeItem(STORAGE_KEYS.exhausted);
  localStorage.removeItem(STORAGE_KEYS.deadline);
}

/**
 * Gets the current session status
 */
export function getSessionStatus() {
  const isExhausted = localStorage.getItem(STORAGE_KEYS.exhausted) === 'true';
  const remainingMs = getRemainingMs();
  const isValid = !isExhausted && remainingMs > 0;
  
  return {
    isExhausted,
    remainingMs,
    isValid,
    expiresAt: getExpirationTime()
  };
}

/**
 * Gets the expiration time of the current session
 */
function getExpirationTime(): number | null {
  if (typeof window === 'undefined') return null;
  
  const sessionData = localStorage.getItem(STORAGE_KEYS.session);
  if (!sessionData) return null;
  
  try {
    const { expiresAt } = JSON.parse(sessionData);
    return expiresAt;
  } catch (e) {
    console.error('Error getting expiration time:', e);
    return null;
  }
}

// Initialize session state on module load
if (typeof window !== 'undefined') {
  const sessionData = localStorage.getItem(STORAGE_KEYS.session);
  if (sessionData) {
    try {
      const { expiresAt } = JSON.parse(sessionData);
      if (now() >= expiresAt) {
        endSession();
      }
    } catch (e) {
      console.error('Error initializing session state:', e);
      resetAll();
    }
  } else {
    // No session data found, ensure clean state
    resetAll();
  }
}