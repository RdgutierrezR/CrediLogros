const getApiUrl = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5002/api';
  }
  
  return `http://${hostname}:5002/api`;
};

const CONFIG = {
  FRONTEND_URL: window.location.origin,
  API_URL: getApiUrl()
};

console.log('API_URL configurado:', CONFIG.API_URL);

export const API_URL = CONFIG.API_URL;
export const FRONTEND_URL = CONFIG.FRONTEND_URL;