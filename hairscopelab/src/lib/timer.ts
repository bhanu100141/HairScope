const STORAGE_KEYS = {
  deadline: 'hs_deadline_ts',
  exhausted: 'hs_exhausted'
} as const;

// Allocation in minutes (configure here)
export const ALLOCATION_MINUTES = 10;

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
    const deadline = now() + (ALLOCATION_MINUTES * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.deadline, deadline.toString());
    console.log(`Session started. Expires in ${ALLOCATION_MINUTES} minutes.`);
  } else {
    console.log('Using existing deadline:', new Date(Number(existing)).toISOString());
  }
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
  
  const dl = getDeadline();
  if (!dl) return ALLOCATION_MINUTES * 60 * 1000; // If never started, full time remains
  
  const remaining = Math.max(0, dl - now());
  console.debug(`Remaining time: ${Math.floor(remaining / 1000)}s`);
  return remaining;
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