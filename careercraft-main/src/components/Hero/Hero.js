import React, { useContext } from 'react';
import './Hero.css';
import { AuthContext } from '../../context/AuthContext';

function Hero() {
  const { user } = useContext(AuthContext);

  // Don't render the Hero section if user is logged in
  if (user) {
    return null;
  }

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Welcome to <span className="brand-text">Career<span className="brand-bold">Craft</span></span>
        </h1>
        <p className="hero-tagline">Your Gateway to Professional Success</p>

        <div className="feature-cards">
          <div className="feature-card">
            <i className="fas fa-graduation-cap"></i>
            <h3>Personalized Learning</h3>
            <p>Tailored course recommendations based on your skills and career goals.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-chart-line"></i>
            <h3>Track Progress</h3>
            <p>Monitor your learning journey with detailed progress tracking.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-briefcase"></i>
            <h3>Career Opportunities</h3>
            <p>Access curated job recommendations matching your profile.</p>
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <h2>500+</h2>
            <p>Courses Available</p>
          </div>
          <div className="stat-item">
            <h2>10k+</h2>
            <p>Active Students</p>
          </div>
          <div className="stat-item">
            <h2>95%</h2>
            <p>Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero; 