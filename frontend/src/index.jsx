// frontend/src/index.js

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
        <ThemeProvider>      {/* Wrap with ThemeProvider */}
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeProvider>      {/* Wrap with ThemeProvider */}
    </BrowserRouter>
);