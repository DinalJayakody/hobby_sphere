// Single source of truth for the backend origin. Set via VITE_BACKEND_URL
// (.env for the default, .env.local for a personal override — see .env.example).
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
