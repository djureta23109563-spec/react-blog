// frontend/src/api/axios.js

import axios from 'axios';

// Helper function to get API URL
const getApiUrl = () => {
    // Check if we're in production (hostname is not localhost)
    const isProduction = window.location.hostname !== 'localhost';
    
    // For development (localhost)
    if (!isProduction) {
        return 'http://localhost:5000/api';
    }
    
    // For production - after deployment, update this
    // You'll change this after deploying backend to Render
    return 'https://your-backend.onrender.com/api';
};

// Create an Axios instance with base URL
const instance = axios.create({
    baseURL: getApiUrl(),
});

// Debug: Log the API URL being used
console.log('🔧 API Base URL:', getApiUrl());

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
            console.log('❌ Network error. Make sure backend is running at:', getApiUrl());
        }
        
        console.error(`❌ Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status}`);
        
        return Promise.reject(error);
    }
);

export default instance;