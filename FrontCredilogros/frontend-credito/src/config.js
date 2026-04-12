const getApiUrl = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  return `http://${hostname}:5000/api`;
};

const API_URL = getApiUrl();
console.log('API_URL configurado:', API_URL);

export { API_URL };