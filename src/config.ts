// Single source of truth for the backend origin. Set via VITE_BACKEND_URL
// (.env for the default, .env.local for a personal override — see .env.example).
// export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://82.29.160.211:8080';

// Sign in with Apple (JS SDK) — requires a Services ID + verified redirect
// URI registered in the Apple Developer portal. Until VITE_APPLE_CLIENT_ID
// is set, the Apple button stays hidden rather than shipping a button that
// can never work — see .env.example for what to fill in.
export const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || '';
export const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin;

