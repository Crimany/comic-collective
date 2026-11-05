import axios from 'axios';

const api = axios.create({
  // relative URLs: in development the dev server's "proxy" setting forwards /api to the backend,
  // so the app also works from other devices on the LAN
  baseURL: '/',
});

// if the session is no longer valid, sign the user out so they can request a new link
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response.data?.message?.startsWith('Not authorized,')) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
 
export default api;
