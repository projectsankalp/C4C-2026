import axios from 'axios';

// The ngrok URL pointing to the Node.js backend
// IMPORTANT: Update this if ngrok restarts!
export const API_URL = 'https://untrekked-shalanda-agamically.ngrok-free.dev/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});
