import React, { useState, useEffect, useContext } from 'react';
import './LoginForm.css';
import Dashboard from '../Dashboard/Dashboard';
import { db } from '../../firebase/firebase.config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase/firebase.config';

function LoginForm({ isOpen, onClose }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthDate: '',
    completedDegree: '',
    pursuingDegree: '',
    programmingLanguages: [],
    frameworks: [],
    desiredRole: '',
    experience: '',
    projects: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newFramework, setNewFramework] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const jobRoleOptions = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile App Developer",
    "UI/UX Designer",
    "Data Scientist",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "Cloud Engineer",
    "Software Engineer",
    "System Analyst",
    "Product Manager",
    "QA Engineer",
    "Cybersecurity Specialist"
  ];

  const degreeOptions = [
    "Bachelor of Computer Science",
    "Bachelor of Information Technology",
    "Bachelor of Software Engineering",
    "Bachelor of Data Science",
    "Bachelor of Cybersecurity",
    "Bachelor of Information Systems",
    "Bachelor of Artificial Intelligence",
    "Bachelor of Computer Engineering",
    "Master of Computer Science",
    "Master of Information Technology",
    "Master of Software Engineering",
    "Master of Data Science",
    "Master of Cybersecurity"
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        try {
          const userDocRef = doc(db, 'students', user.email);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData(userData);
            setIsLoggedIn(true);
            onClose();
          } else {
            setFormData(prevState => ({
              ...prevState,
              email: user.email
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Save user data to Firestore
      const userDocRef = doc(db, 'students', formData.email);
      await setDoc(userDocRef, formData, { merge: true });
      
      setIsLoggedIn(true);
      onClose();
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("Error saving your data. Please try again.");
    }
  };

  const handleSkillAdd = () => {
    if (newSkill && !formData.programmingLanguages.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        programmingLanguages: [...prev.programmingLanguages, newSkill]
      }));
      setNewSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      programmingLanguages: prev.programmingLanguages.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFrameworkAdd = () => {
    if (newFramework && !formData.frameworks.includes(newFramework)) {
      setFormData(prev => ({
        ...prev,
        frameworks: [...prev.frameworks, newFramework]
      }));
      setNewFramework('');
    }
  };

  const handleFrameworkRemove = (frameworkToRemove) => {
    setFormData(prev => ({
      ...prev,
      frameworks: prev.frameworks.filter(framework => framework !== frameworkToRemove)
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      // Rest of your sign-in logic
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  if (!user) return null;
  if (loading) return <div className="loading">Loading...</div>;
  if (isLoggedIn) return <Dashboard studentData={formData} />;
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Complete Your Profile</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                readOnly={!!user?.email}
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">Birth Date</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="completedDegree">Completed Degree</label>
              <select
                id="completedDegree"
                name="completedDegree"
                value={formData.completedDegree}
                onChange={handleChange}
                required
              >
                <option value="">Select your completed degree</option>
                {degreeOptions.map((degree, index) => (
                  <option key={index} value={degree}>{degree}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pursuingDegree">Pursuing Degree</label>
              <select
                id="pursuingDegree"
                name="pursuingDegree"
                value={formData.pursuingDegree}
                onChange={handleChange}
                required
              >
                <option value="">Select your pursuing degree</option>
                {degreeOptions.map((degree, index) => (
                  <option key={index} value={degree}>{degree}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Technical Skills</h3>
            
            <div className="form-group">
              <label>Programming Languages</label>
              <div className="skill-input-container">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a programming language"
                />
                <button type="button" onClick={handleSkillAdd} className="add-btn">+</button>
              </div>
              <div className="skills-list">
                {formData.programmingLanguages.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleSkillRemove(skill)}
                      className="remove-skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Frameworks/Libraries</label>
              <div className="skill-input-container">
                <input
                  type="text"
                  value={newFramework}
                  onChange={(e) => setNewFramework(e.target.value)}
                  placeholder="Add a framework or library"
                />
                <button type="button" onClick={handleFrameworkAdd} className="add-btn">+</button>
              </div>
              <div className="skills-list">
                {formData.frameworks.map((framework, index) => (
                  <span key={index} className="skill-tag">
                    {framework}
                    <button 
                      type="button" 
                      onClick={() => handleFrameworkRemove(framework)}
                      className="remove-skill"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Career Information</h3>
            
            <div className="form-group">
              <label htmlFor="desiredRole">Desired Job Role</label>
              <select
                id="desiredRole"
                name="desiredRole"
                value={formData.desiredRole}
                onChange={handleChange}
                required
              >
                <option value="">Select desired role</option>
                {jobRoleOptions.map((role, index) => (
                  <option key={index} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experience">Experience</label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Describe your relevant experience..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="projects">Projects</label>
              <textarea
                id="projects"
                name="projects"
                value={formData.projects}
                onChange={handleChange}
                placeholder="List your notable projects..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Professional Links</h3>
            
            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn Profile</label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>

            <div className="form-group">
              <label htmlFor="github">GitHub Profile</label>
              <input
                type="url"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/your-username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="portfolio">Portfolio Website</label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://your-portfolio.com"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">Save Profile</button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm; 