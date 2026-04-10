// frontend/src/App.js

import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';

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

// NEW: Import forgot password pages
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  const location = useLocation();
  const isSplashPage = location.pathname === '/';

  return (
    <>
      {!isSplashPage && <Navbar />}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Splash page at root */}
          <Route path='/' element={
            <PageTransition>
              <SplashPage />
            </PageTransition>
          } />
          
          {/* Home page */}
          <Route path='/home' element={
            <PageTransition>
              <HomePage />
            </PageTransition>
          } />
          
          {/* Other public routes */}
          <Route path='/about' element={
            <PageTransition>
              <AboutPage />
            </PageTransition>
          } />
          <Route path='/contact' element={
            <PageTransition>
              <ContactPage />
            </PageTransition>
          } />
          <Route path='/message' element={
            <PageTransition>
              <MessagePage />
            </PageTransition>
          } />
          <Route path='/posts/:id' element={
            <PageTransition>
              <PostPage />
            </PageTransition>
          } />
          <Route path='/login' element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          } />
          <Route path='/register' element={
            <PageTransition>
              <RegisterPage />
            </PageTransition>
          } />

          {/* NEW: Forgot password routes */}
          <Route path='/forgot-password' element={
            <PageTransition>
              <ForgotPasswordPage />
            </PageTransition>
          } />
          <Route path='/reset-password/:token' element={
            <PageTransition>
              <ResetPasswordPage />
            </PageTransition>
          } />

          {/* Protected routes */}
          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ProfilePage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path='/create-post'
            element={
              <ProtectedRoute>
                <PageTransition>
                  <CreatePostPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path='/edit-post/:id'
            element={
              <ProtectedRoute>
                <PageTransition>
                  <EditPostPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path='/admin'
            element={
              <ProtectedRoute role='admin'>
                <PageTransition>
                  <AdminPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          
          {/* Deleted Post View */}
          <Route
            path='/deleted-post/:id'
            element={
              <ProtectedRoute role='admin'>
                <PageTransition>
                  <DeletedPostPage />
                </PageTransition>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;