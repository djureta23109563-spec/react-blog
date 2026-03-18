// frontend/src/api/axios.js

import axios from 'axios';

// Create an Axios instance with base URL
const instance = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// This interceptor runs before EVERY request.
// It reads the token from localStorage and adds it to the Authorization header.
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;                                                                                                            