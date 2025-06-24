import React from 'react';
import './Contact.css';

function Contact() {
  const contactInfo = [
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Location',
      content: 'Jalgaon, MH 425001'
    },
    {
      icon: 'fas fa-phone',
      title: 'Phone',
      content: '+1 (555) 123-4567'
    },
    {
      icon: 'fas fa-envelope',
      title: 'Email',
      content: 'contact@careercraft.com'
    },
    {
      icon: 'fas fa-clock',
      title: 'Hours',
      content: 'Mon - Fri: 9:00 AM - 6:00 PM'
    }
  ];

  return (
    <div className="contact-container">
      <header className="contact-header">
        <h1>Contact Us</h1>
        <p>Get in touch with us for any questions or inquiries</p>
      </header>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-grid">
            {contactInfo.map((info, index) => (
              <div key={index} className="info-card">
                <div className="info-icon">
                  <i className={info.icon}></i>
                </div>
                <h3>{info.title}</h3>
                <p>{info.content}</p>
              </div>
            ))}
          </div>

          <div className="social-links">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="social-icon">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact; 