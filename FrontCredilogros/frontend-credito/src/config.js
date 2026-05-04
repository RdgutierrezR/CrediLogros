const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return 'https://credilogros.onrender.com/api';
  }
  return 'http://localhost:5002/api';
};

const CONFIG = {
  FRONTEND_URL: window.location.origin,
  API_URL: getApiUrl()
};

console.log('API_URL configurado:', CONFIG.API_URL);

export const API_URL = CONFIG.API_URL;
export const FRONTEND_URL = CONFIG.FRONTEND_URL;