const STORAGE_KEYS = {
  deadline: 'hs_deadline_ts',
  exhausted: 'hs_exhausted',
  session: 'hs_session'
} as const;

// Allocation in minutes (configure here)
export const ALLOCATION_MINUTES = 10;

const SESSION_DURATION = ALLOCATION_MINUTES * 60 * 1000; // 10 minutes in milliseconds

export function now() {
  return Date.now();
}

/**
 * Sets the session deadline if not already set
 */
export function setDeadlineOnce() {
  if (typeof window === 'undefined') return;
  
  // Reset the exhausted flag when setting a new deadline
  localStorage.removeItem(STORAGE_KEYS.exhausted);
  
  const existing = localStorage.getItem(STORAGE_KEYS.deadline);
  if (!existing) {
    const deadline = now() + SESSION_DURATION;
    localStorage.setItem(STORAGE_KEYS.deadline, deadline.toString());
    console.log(`Session started. Expires in ${ALLOCATION_MINUTES} minutes.`);
  } else {
    console.log('Using existing deadline:', new Date(Number(existing)).toISOString());
  }
}

/**
 * Starts a new session
 */
export function startSession(): void {
  if (typeof window === 'undefined') return;
  
  const sessionData = {
    startedAt: now(),
    expiresAt: now() + SESSION_DURATION
  };
  sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionData));
  sessionStorage.removeItem(STORAGE_KEYS.exhausted);
}

/**
 * Ends the current session
 */
export function endSession(): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem(STORAGE_KEYS.session);
  sessionStorage.setItem(STORAGE_KEYS.exhausted, 'true');
}

/**
 * Gets the stored deadline timestamp
 */
export function getDeadline(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.deadline);
  return raw ? Number(raw) : null;
}

/**
 * Gets remaining time in milliseconds
 */
export function getRemainingMs(): number {
  if (typeof window === 'undefined') return 0;
  
  const sessionData = sessionStorage.getItem(STORAGE_KEYS.session);
  if (!sessionData) {
    const dl = getDeadline();
    if (!dl) return SESSION_DURATION; // If never started, full time remains
    return Math.max(0, dl - now());
  }
  
  try {
    const { expiresAt } = JSON.parse(sessionData);
    return Math.max(0, expiresAt - now());
  } catch (e) {
    console.error('Error parsing session data:', e);
    return 0;
  }
}

/**
 * Marks the session as exhausted
 */
export function markExhausted() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.exhausted, '1');
  console.log('Session marked as exhausted');
}

/**
 * Checks if the session is exhausted
 */
export function isExhausted(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Check if explicitly marked as exhausted
  if (localStorage.getItem(STORAGE_KEYS.exhausted) === '1') {
    console.log('Session is explicitly marked as exhausted');
    return true;
  }
  
  // Check if deadline exists and is in the past
  const deadline = getDeadline();
  const nowTime = now();
  
  if (deadline && deadline <= nowTime) {
    console.log('Session deadline has passed, marking as exhausted');
    markExhausted();
    return true;
  }
  
  // Check if session storage is exhausted
  if (sessionStorage.getItem(STORAGE_KEYS.exhausted) === 'true') {
    console.log('Session storage is exhausted');
    return true;
  }
  
  // Extra check: If no deadline is set but we're in the lab, consider it exhausted
  if (!deadline && window.location.pathname === '/lab') {
    console.log('No deadline set but in lab, marking as exhausted');
    markExhausted();
    return true;
  }
  
  return false;
}

/**
 * Completely resets all timer-related storage
 */
export function resetAll() {
  if (typeof window === 'undefined') return;
  
  console.log('Resetting all timer data');
  
  // Clear all timer-related data
  localStorage.removeItem(STORAGE_KEYS.deadline);
  localStorage.removeItem(STORAGE_KEYS.exhausted);
  sessionStorage.removeItem(STORAGE_KEYS.session);
  sessionStorage.removeItem(STORAGE_KEYS.exhausted);
  
  // Force clear by setting and immediately removing
  localStorage.setItem(STORAGE_KEYS.exhausted, '1');
  localStorage.removeItem(STORAGE_KEYS.exhausted);
  
  // Clear any cached values
  if (window.sessionStorage) {
    sessionStorage.clear();
  }
  
  // Force a storage event to notify all tabs
  const event = new StorageEvent('storage', {
    key: STORAGE_KEYS.exhausted,
    newValue: null,
    oldValue: '1',
    storageArea: localStorage,
    url: window.location.href
  });
  
  window.dispatchEvent(event);
  
  // Ensure the session is marked as exhausted
  markExhausted();
}

/**
 * Gets the current session status
 */
export function getSessionStatus() {
  if (typeof window === 'undefined') return { hasActiveSession: false, remainingMs: 0 };
  
  const remainingMs = getRemainingMs();
  const isExpired = isExhausted() || remainingMs <= 0;
  
  return {
    hasActiveSession: !isExpired && remainingMs > 0,
    remainingMs,
    isExhausted: isExpired,
    expiresAt: getDeadline()
  };
}

// Initialize session state on module load
if (typeof window !== 'undefined') {
  const remaining = getRemainingMs();
  if (remaining <= 0) {
    resetAll();
  }
}