// Backend API Configuration
// Vite environment variables are used to switch between 'local' and 'production'
// By default, it uses 'local' for dev and 'production' for builds

const isProd = import.meta.env.PROD;
const isDev = import.meta.env.DEV;
const mode = import.meta.env.MODE;

// Log all environment info for debugging
console.log('🔍 [ENV] PROD:', isProd, 'DEV:', isDev, 'MODE:', mode);

// Prioritize VITE_API_URL. If missing and not on localhost, assume production.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? 'https://zunf-medicare-website.up.railway.app'
    : 'http://localhost:5000');

const API_MODE = import.meta.env.VITE_API_MODE || (isProd ? 'production' : 'local');

console.log(`🔧 [API] Resolved URL: ${API_BASE_URL} (Mode: ${API_MODE})`);
