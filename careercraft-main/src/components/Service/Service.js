import React from 'react';
import './Service.css';

function Service() {
  const services = [
    {
      id: 1,
      icon: 'fas fa-brain',
      title: 'Personalized Learning Recommendations',
      description: 'Get tailored learning paths and course recommendations based on your skill level and career goals.'
    },
    {
      id: 2,
      icon: 'fas fa-robot',
      title: 'AI-Powered Coding Challenges',
      description: 'Practice with intelligent coding challenges that adapt to your skill level and learning pace.'
    },
    {
      id: 3,
      icon: 'fas fa-lightbulb',
      title: 'Mini Project Suggestions',
      description: 'Discover personalized project ideas that help you build a compelling portfolio.'
    },
    {
      id: 4,
      icon: 'fas fa-briefcase',
      title: 'Smart Job Matching',
      description: 'Connect with job opportunities that perfectly match your skills and career aspirations.'
    }
  ];

  return (
    <div className="service-container">
      <header className="service-header">
        <h1>Our Services</h1>
        <p>Empowering your tech career with AI-driven learning and opportunities</p>
      </header>

      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-icon">
              <i className={service.icon}></i>
            </div>
            <h2>{service.title}</h2>
            <p className="service-description">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Service; 