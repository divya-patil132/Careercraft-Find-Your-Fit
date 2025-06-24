import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import LoginForm from '../LoginForm/LoginForm';
import { auth } from '../../firebase/firebase.config';
import { GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver, signOut } from 'firebase/auth';
import { AuthContext } from '../../context/AuthContext';

function Navbar() {
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      
      if (result.user) {
        setIsLoginFormOpen(true);
        setError(null);
      }
    } catch (error) {
      console.error("Error during Google sign in:", error);
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoginFormOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="nav-content">
            {/* Logo */}
            <div className="logo">
              <Link to="/">CareerCraft</Link>
            </div>

            {/* Navigation Links */}
            <div className="nav-links">
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                Home
              </Link>
              <Link to="/services" className={location.pathname === '/services' ? 'active' : ''}>
                Services
              </Link>
              <Link to="/jobs" className={location.pathname === '/jobs' ? 'active' : ''}>
                Jobs
              </Link>
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                Contact
              </Link>
              
              {user ? (
                <div className="user-menu">
                  <span className="user-email">{user.email}</span>
                  <button className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  className="login-btn"
                  onClick={handleGoogleLogin}
                >
                  <div className="google-btn-content">
                    <GoogleIcon />
                    Continue with Google
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <LoginForm 
        isOpen={isLoginFormOpen} 
        onClose={() => setIsLoginFormOpen(false)}
        userEmail={user?.email}
      />
    </>
  );
}

export default Navbar; 