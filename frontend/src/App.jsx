// frontend/src/App.js

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import SplashPage
import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PostPage from './pages/PostPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import AdminPage from './pages/AdminPage';

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                {/* Splash page at root - only shows on initial visit */}
                <Route path='/' element={<SplashPage />} />
                
                {/* Home page at /home - where splash redirects to */}
                <Route path='/home' element={<HomePage />} />
                
                {/* Other public routes */}
                <Route path='/about' element={<AboutPage />} />
                <Route path='/contact' element={<ContactPage />} />
                <Route path='/posts/:id' element={<PostPage />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />

                {/* Protected routes */}
                <Route
                    path='/profile'
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/create-post'
                    element={
                        <ProtectedRoute>
                            <CreatePostPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/edit-post/:id'
                    element={
                        <ProtectedRoute>
                            <EditPostPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin only */}
                <Route
                    path='/admin'
                    element={
                        <ProtectedRoute role='admin'>
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;