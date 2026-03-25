// frontend/src/App.js

import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import SplashPage
import SplashPage from './pages/SplashPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import MessagePage from './pages/MessagePage';
import PostPage from './pages/PostPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import AdminPage from './pages/AdminPage';
import DeletedPostPage from './pages/DeletedPostPage';

function App() {
  const location = useLocation();
  const isSplashPage = location.pathname === '/';

  return (
    <>
      {!isSplashPage && <Navbar />}
      
      <Routes>
        {/* Splash page at root */}
        <Route path='/' element={<SplashPage />} />
        
        {/* Home page */}
        <Route path='/home' element={<HomePage />} />
        
        {/* Other public routes */}
        <Route path='/about' element={<AboutPage />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/message' element={<MessagePage />} />
        <Route path='/posts/:id' element={<PostPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path='/create-post' element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
        <Route path='/edit-post/:id' element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />

        {/* Admin only */}
        <Route path='/admin' element={<ProtectedRoute role='admin'><AdminPage /></ProtectedRoute>} />
        
        {/* Deleted Post View */}
        <Route path='/deleted-post/:id' element={<ProtectedRoute role='admin'><DeletedPostPage /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;