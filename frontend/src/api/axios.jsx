// frontend/src/api/axios.js

import axios from 'axios';

// TEMPORARY: Hardcode the production URL
const API_URL = 'https://react-blog-7yna.onrender.com/api';

// Create an Axios instance with base URL
const instance = axios.create({
    baseURL: API_URL,
});

// Debug: Log the API URL being used
console.log('🔧 API Base URL:', API_URL);

// This interceptor runs before EVERY request.
// It reads the token from localStorage and adds it to the Authorization header.
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request');
    } else {
        console.log('⚠️ No token found');
    }
    return config;
});

// Response interceptor for better error handling
instance.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors (token expired)
        if (error.response?.status === 401) {
            console.log('❌ Token expired or invalid. Please login again.');
            localStorage.removeItem('token');
        }
        
        // Handle 403 Forbidden errors
        if (error.response?.status === 403) {
            console.log('❌ Access denied. You do not have permission.');
        }
        
        // Handle network errors
        if (error.message === 'Network Error') {
            console.log('❌ Network error. Make sure backend is running at:', API_URL);
        }
        
        console.error(`❌ Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`);
        
        return Promise.reject(error);
    }
);

export default instance;