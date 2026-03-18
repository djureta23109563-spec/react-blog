// frontend/src/context/AuthContext.js

import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On app load: if a token exists in localStorage, fetch the user's data
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Initial token check:', token ? 'Token exists' : 'No token');
        
        if (token) {
            API.get('/auth/me')
                .then(res => {
                    console.log('User data fetched:', res.data);
                    setUser(res.data);
                })
                .catch((err) => {
                    console.error('Failed to fetch user:', err);
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // login(): call the backend, save token, store user in state
    const login = async (email, password) => {
        try {
            console.log('Attempting login for:', email);
            
            const { data } = await API.post('/auth/login', { email, password });
            
            console.log('Login response data:', data); // See what we get
            console.log('Token received:', data.token ? 'Yes' : 'No');
            console.log('User data:', data.user);
            
            // Store token
            localStorage.setItem('token', data.token);
            
            // Set user state
            setUser(data.user);
            
            return data.user;
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    };

    // logout(): clear token and user from memory
    const logout = () => {
        console.log('Logging out');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook — use this instead of useContext(AuthContext) everywhere
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};