import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('petsneha_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Temporary diagnostic — remove once logout-on-booking bug is confirmed fixed
    console.log('Axios error intercepted:', {
      status: error?.response?.status,
      url: error?.config?.url,
      message: error?.response?.data?.message,
    });

    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      console.log('401 detected — clearing token and redirecting from:', window.location.pathname);
      // Don't redirect if this is a logout request (which may naturally return 401)
      const isLogoutRequest = error?.config?.url?.includes('/auth/logout');
      
      if (!isLogoutRequest) {
        // Only clear token and redirect if we are on a protected page.
        // Public/auth pages do not need a redirect — it causes a redirect loop.
        const publicPaths = ['/', '/login', '/vet/login', '/register', '/forgot-password', '/reset-password', '/vets-landing', '/vet/register'];
        const isPublicPage = publicPaths.some((p) => window.location.pathname === p || window.location.pathname.startsWith('/reset-password/'));

        if (!isPublicPage) {
          const role = localStorage.getItem('petsneha_role');
          localStorage.removeItem('petsneha_token');
          localStorage.removeItem('petsneha_role');
          
          // Redirect to role-specific login page
          const loginPath = role === 'vet' ? '/vet/login' : '/login';
          window.location.href = loginPath;
        }
      } else {
        // For logout requests, just clear the token silently
        localStorage.removeItem('petsneha_token');
        localStorage.removeItem('petsneha_role');
      }
    }

    const message = error?.response?.data?.message || error?.message || 'Could not connect to server. Please try again.';
    return Promise.reject(message);
  },
);

export default axiosInstance;
