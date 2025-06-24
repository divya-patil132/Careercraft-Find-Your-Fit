import React, { useState, useEffect, useContext } from 'react';
import './Dashboard.css';
import CourseRecommendations from '../CourseRecommendations/CourseRecommendations';
import PracticeContent from '../Practice/PracticeContent';
import QuizContent from '../Practice/QuizContent';
import { db, auth } from '../../firebase/firebase.config';
import { collection, query, where, getDocs, onSnapshot, updateDoc, doc, setDoc } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { jobsData } from '../../data/jobsData';

function Dashboard({ studentData }) {
  const [courseProgress, setCourseProgress] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const [activePractice, setActivePractice] = useState('Coding Challenge');
  const [submittedProjects, setSubmittedProjects] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [newSkill, setNewSkill] = useState('');

  console.log("User data:", user);

  // Initialize editedProfile when studentData changes
  useEffect(() => {
    setEditedProfile(studentData);
  }, [studentData]);

  // Calculate completion percentage based on filled fields
  const calculateProfileCompletion = () => {
    const totalFields = Object.keys(studentData).length;
    const filledFields = Object.values(studentData).filter(value =>
      value && (Array.isArray(value) ? value.length > 0 : value.trim() !== '')
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  // Replace the existing useEffect for course progress with this real-time listener
  useEffect(() => {
    let unsubscribe;

    const setupProgressListener = async () => {
      if (!auth.currentUser) return;

      try {
        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, where("studentEmail", "==", studentData.email));

        // Set up real-time listener
        unsubscribe = onSnapshot(q, (snapshot) => {
          const progress = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            progress: doc.data().progress || 0
          }));

          setCourseProgress(progress);
          setError(null);
        }, (error) => {
          console.error("Error listening to course progress:", error);
          setError("Failed to load real-time course progress. Please refresh the page.");
        });

      } catch (error) {
        console.error("Error setting up progress listener:", error);
        setError("Failed to initialize progress tracking. Please try again later.");
      }
    };

    if (studentData.email) {
      setupProgressListener();
    }

    // Cleanup listener on component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [studentData.email]);

  // Add useEffect to fetch submitted projects
  useEffect(() => {
    const fetchSubmittedProjects = async () => {
      if (!studentData?.email) return;

      try {
        const q = query(
          collection(db, 'practice'),
          where('studentEmail', '==', studentData.email),
          where('isCompleted', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubmittedProjects(projects);
      } catch (error) {
        console.error('Error fetching submitted projects:', error);
        setError('Failed to load submitted projects');
      }
    };

    fetchSubmittedProjects();
  }, [studentData?.email]);

  const progress = calculateProfileCompletion();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Offset to account for header and spacing
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  const updateCourseProgress = async (courseId, newProgress) => {
    if (!auth.currentUser) return;

    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef,
        where("studentEmail", "==", studentData.email),
        where("courseId", "==", courseId)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          progress: newProgress,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      setError("Failed to update course progress. Please try again.");
    }
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditedProfile(studentData); // Reset to original data
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userDocRef = doc(db, 'students', studentData.email);
      await setDoc(userDocRef, editedProfile, { merge: true });
      
      // Update the studentData prop by triggering a page refresh
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editedProfile.programmingLanguages?.includes(newSkill.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        programmingLanguages: [...(prev.programmingLanguages || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditedProfile(prev => ({
      ...prev,
      programmingLanguages: prev.programmingLanguages.filter(skill => skill !== skillToRemove)
    }));
  };

  // Filter jobs based on user's desired role
  const filteredJobs = jobsData.filter(job => {
    if (!studentData?.desiredRole) return true; // Show all jobs if no role selected
    
    // Convert both strings to lowercase for case-insensitive comparison
    const jobTitle = job.title.toLowerCase();
    const desiredRole = studentData.desiredRole.toLowerCase();
    
    // Check if job title contains the desired role
    return jobTitle.includes(desiredRole) || 
           // Check if job tags contain the desired role
           job.tags.some(tag => tag.toLowerCase().includes(desiredRole));
  });

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            {user && user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="profile-image"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="profile-placeholder">
                {studentData?.name ? studentData.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <h3 className="user-name">{studentData?.name || 'User'}</h3>
            <button className="edit-profile-btn" onClick={handleEditProfile}>
              <i className="fas fa-edit"></i> Edit Profile
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => scrollToSection('overview')}
          >
            <i className="fas fa-home"></i>
            Overview
          </div>
          <div
            className={`nav-item ${activeSection === 'progress' ? 'active' : ''}`}
            onClick={() => scrollToSection('progress')}
          >
            <i className="fas fa-chart-line"></i>
            Progress
          </div>
          <div
            className={`nav-item ${activeSection === 'skills' ? 'active' : ''}`}
            onClick={() => scrollToSection('skills')}
          >
            <i className="fas fa-code"></i>
            Skills
          </div>

          <div
            className={`nav-item ${activeSection === 'career' ? 'active' : ''}`}
            onClick={() => scrollToSection('career')}
          >
            <i className="fas fa-graduation-cap"></i>
            Career
          </div>
          <div
            className={`nav-item ${activeSection === 'practice' ? 'active' : ''}`}
            onClick={() => scrollToSection('practice')}
          >
            <i className="fas fa-code"></i>
            Practice
          </div>
          <div
            className={`nav-item ${activeSection === 'courses' ? 'active' : ''}`}
            onClick={() => scrollToSection('courses')}
          >
            <i className="fas fa-book"></i>
            Courses
          </div>
          <div
            className={`nav-item ${activeSection === 'jobs' ? 'active' : ''}`}
            onClick={() => scrollToSection('jobs')}
          >
            <i className="fas fa-briefcase"></i>
            Jobs
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <header className="main-header">
          <h2>Student Dashboard</h2>
          <div className="profile-completion">
            <div className="completion-text">
              Profile Completion: {progress}%
            </div>
            <div className="completion-bar">
              <div
                className="completion-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <div className="dashboard-content">


          {/* Overview Section */}
          <section id="overview" className="dashboard-section">
            <h2>Profile Overview</h2>
            <div className="profile-info">
              <div className="info-group">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> {studentData.name}</p>
                <p><strong>Email:</strong> {studentData.email}</p>
                <p><strong>Birth Date:</strong> {studentData.birthDate}</p>
                <p><strong>Completed Degree:</strong> {studentData.completedDegree || 'None'}</p>
                <p><strong>Pursuing Degree:</strong> {studentData.pursuingDegree || 'None'}</p>
              </div>
              <div className="info-group">
                <h3>Professional Links</h3>
                <div className="links-grid">
                  {studentData.linkedin && (
                    <a href={studentData.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fab fa-linkedin"></i>
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {studentData.github && (
                    <a href={studentData.github} target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fab fa-github"></i>
                      <span>GitHub</span>
                    </a>
                  )}
                  {studentData.portfolio && (
                    <a href={studentData.portfolio} target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fas fa-globe"></i>
                      <span>Portfolio</span>
                    </a>
                  )}
                  {studentData.resume && (
                    <a href={studentData.resume} target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fas fa-file-alt"></i>
                      <span>Resume</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
          
          {/* Edit Profile Modal */}
          {isEditModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Edit Profile</h2>
                  <button className="close-btn" onClick={handleCloseEditModal}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <form onSubmit={handleProfileSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={editedProfile.name || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="birthDate">Birth Date</label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={editedProfile.birthDate || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="completedDegree">Completed Degree</label>
                    <select
                      id="completedDegree"
                      name="completedDegree"
                      value={editedProfile.completedDegree || ''}
                      onChange={handleProfileChange}
                    >
                      <option value="">None</option>
                      <option value="Bachelor of Computer Science">Bachelor of Computer Science</option>
                      <option value="Bachelor of Information Technology">Bachelor of Information Technology</option>
                      <option value="Bachelor of Software Engineering">Bachelor of Software Engineering</option>
                      <option value="Bachelor of Data Science">Bachelor of Data Science</option>
                      <option value="Bachelor of Cybersecurity">Bachelor of Cybersecurity</option>
                      <option value="Bachelor of Information Systems">Bachelor of Information Systems</option>
                      <option value="Bachelor of Artificial Intelligence">Bachelor of Artificial Intelligence</option>
                      <option value="Bachelor of Computer Engineering">Bachelor of Computer Engineering</option>
                      <option value="Master of Computer Science">Master of Computer Science</option>
                      <option value="Master of Information Technology">Master of Information Technology</option>
                      <option value="Master of Software Engineering">Master of Software Engineering</option>
                      <option value="Master of Data Science">Master of Data Science</option>
                      <option value="Master of Cybersecurity">Master of Cybersecurity</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="pursuingDegree">Pursuing Degree</label>
                    <select
                      id="pursuingDegree"
                      name="pursuingDegree"
                      value={editedProfile.pursuingDegree || ''}
                      onChange={handleProfileChange}
                    >
                      <option value="">None</option>
                      <option value="Bachelor of Computer Science">Bachelor of Computer Science</option>
                      <option value="Bachelor of Information Technology">Bachelor of Information Technology</option>
                      <option value="Bachelor of Software Engineering">Bachelor of Software Engineering</option>
                      <option value="Bachelor of Data Science">Bachelor of Data Science</option>
                      <option value="Bachelor of Cybersecurity">Bachelor of Cybersecurity</option>
                      <option value="Bachelor of Information Systems">Bachelor of Information Systems</option>
                      <option value="Bachelor of Artificial Intelligence">Bachelor of Artificial Intelligence</option>
                      <option value="Bachelor of Computer Engineering">Bachelor of Computer Engineering</option>
                      <option value="Master of Computer Science">Master of Computer Science</option>
                      <option value="Master of Information Technology">Master of Information Technology</option>
                      <option value="Master of Software Engineering">Master of Software Engineering</option>
                      <option value="Master of Data Science">Master of Data Science</option>
                      <option value="Master of Cybersecurity">Master of Cybersecurity</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="desiredRole">Desired Role</label>
                    <select
                      id="desiredRole"
                      name="desiredRole"
                      value={editedProfile.desiredRole || ''}
                      onChange={handleProfileChange}
                    >
                      <option value="">Select a role</option>
                      <optgroup label="Technology">
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="Mobile App Developer">Mobile App Developer</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="Cloud Architect">Cloud Architect</option>
                        <option value="Security Engineer">Security Engineer</option>
                        <option value="Blockchain Developer">Blockchain Developer</option>
                        <option value="Game Developer">Game Developer</option>
                      </optgroup>
                      <optgroup label="Business">
                        <option value="Product Manager">Product Manager</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Business Analyst">Business Analyst</option>
                        <option value="Data Analyst">Data Analyst</option>
                        <option value="Marketing Manager">Marketing Manager</option>
                        <option value="Digital Marketing Specialist">Digital Marketing Specialist</option>
                        <option value="Sales Representative">Sales Representative</option>
                        <option value="Business Development Manager">Business Development Manager</option>
                        <option value="Financial Analyst">Financial Analyst</option>
                        <option value="HR Manager">HR Manager</option>
                        <option value="Consultant">Consultant</option>
                        <option value="Entrepreneur">Entrepreneur</option>
                      </optgroup>
                      <optgroup label="Arts & Media">
                        <option value="Graphic Designer">Graphic Designer</option>
                        <option value="Web Designer">Web Designer</option>
                        <option value="Content Creator">Content Creator</option>
                        <option value="Video Editor">Video Editor</option>
                        <option value="Animator">Animator</option>
                        <option value="Illustrator">Illustrator</option>
                        <option value="Photographer">Photographer</option>
                        <option value="Social Media Manager">Social Media Manager</option>
                        <option value="Copywriter">Copywriter</option>
                        <option value="Art Director">Art Director</option>
                        <option value="Motion Designer">Motion Designer</option>
                        <option value="3D Artist">3D Artist</option>
                      </optgroup>
                      <optgroup label="Other">
                        <option value="Student">Student</option>
                        <option value="Freelancer">Freelancer</option>
                        <option value="Other">Other</option>
                      </optgroup>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="experience">Experience</label>
                    <textarea
                      id="experience"
                      name="experience"
                      value={editedProfile.experience || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="projects">Projects</label>
                    <textarea
                      id="projects"
                      name="projects"
                      value={editedProfile.projects || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="linkedin">LinkedIn URL</label>
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={editedProfile.linkedin || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="github">GitHub URL</label>
                    <input
                      type="url"
                      id="github"
                      name="github"
                      value={editedProfile.github || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="portfolio">Portfolio URL</label>
                    <input
                      type="url"
                      id="portfolio"
                      name="portfolio"
                      value={editedProfile.portfolio || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Technical Skills</label>
                    <div className="skills-input-group">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a new skill"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <button type="button" className="add-skill-btn" onClick={handleAddSkill}>
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    <div className="skills-list">
                      {editedProfile.programmingLanguages?.map((skill, index) => (
                        <div key={index} className="skill-tag">
                          {skill}
                          <button
                            type="button"
                            className="remove-skill-btn"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={handleCloseEditModal}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Course Progress Section */}
          <section id="progress" className="dashboard-section">
            <h3>Course Progress</h3>
            <div className="course-progress-container">
              {courseProgress.length > 0 ? (
                <div className="course-progress-item">
                  <div className="course-info">
                    <h4>Overall Progress</h4>
                    <div className="progress-stats">
                      <span className="progress-percentage">
                        {Math.round(courseProgress.reduce((acc, course) => acc + course.progress, 0) / courseProgress.length)}%
                      </span>
                      <span className={`progress-status ${courseProgress.every(course => course.progress === 100) ? 'completed' : 'in-progress'}`}>
                        {courseProgress.every(course => course.progress === 100) ? 'All Courses Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>

                  <div className="progress-bar-wrapper">
                    <div className="progress-segments">
                      {[0, 25, 50, 75, 100].map(segment => (
                        <div key={segment} className="segment-marker">
                          <span className="segment-line"></span>
                          <span className="segment-label">{segment}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.round(courseProgress.reduce((acc, course) => acc + course.progress, 0) / courseProgress.length)}%` }}
                      >
                        <span className="progress-indicator"></span>
                      </div>
                    </div>
                  </div>

                  <div className="course-details">
                    <div className="detail-item">
                      <span className="label">Enrolled Courses</span>
                      <span className="value">{courseProgress.length}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Completed Courses</span>
                      <span className="value">{courseProgress.filter(course => course.progress === 100).length}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">In Progress</span>
                      <span className="value">{courseProgress.filter(course => course.progress < 100).length}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-courses-message">
                  <p>You haven't enrolled in any courses yet.</p>
                  <p>Check out our recommended courses to start your learning journey!</p>
                </div>
              )}
            </div>
          </section>

          {/* Skills Section */}
          <section id="skills" className="dashboard-section">
            <h3>Technical Skills</h3>
            <div className="skills-container">
              <div className="skills-group">
                <h4>Programming Languages</h4>
                <div className="skills-tags">
                  {studentData.programmingLanguages?.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="skills-group">
                <h4>Frameworks & Libraries</h4>
                <div className="skills-tags">
                  {studentData.frameworks?.map((framework, index) => (
                    <span key={index} className="skill-tag">{framework}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Career Section */}
          <section id="career" className="dashboard-section">
            <h3>Career Information</h3>
            <div className="career-info">
              <div className="info-block">
                <h4>Desired Role</h4>
                <p>{studentData.desiredRole || 'Not specified'}</p>
              </div>
              <div className="info-block">
                <h4>Experience</h4>
                <p>{studentData.experience || 'No experience listed'}</p>
              </div>
              <div className="info-block">
                <h4>Projects</h4>
                <p>{studentData.projects || 'No projects listed'}</p>
              </div>
            </div>
          </section>

          {/* Practice Section */}
          <section id="practice" className="dashboard-section">
            <h3>Practice</h3>
            <div className="practice-container">
              <div className="practice-header">
                <h3>Practice Challenges</h3>
                <p>Enhance your skills with coding challenges, mini projects, and skill assessments</p>
              </div>
              
              <div className="practice-buttons">
                <button 
                  className={`practice-btn ${activePractice === 'Coding Challenge' ? 'active' : ''}`}
                  onClick={() => setActivePractice('Coding Challenge')}
                >
                  <i className="fas fa-code"></i>
                  <span>Coding Challenge</span>
                </button>
                <button 
                  className={`practice-btn ${activePractice === 'Mini Project' ? 'active' : ''}`}
                  onClick={() => setActivePractice('Mini Project')}
                >
                  <i className="fas fa-project-diagram"></i>
                  <span>Mini Project</span>
                </button>
                <button 
                  className={`practice-btn ${activePractice === 'Quiz' ? 'active' : ''}`}
                  onClick={() => setActivePractice('Quiz')}
                >
                  <i className="fas fa-question-circle"></i>
                  <span>Skill Quiz</span>
                </button>
              </div>
              
              <div className="practice-content">
                {activePractice === 'Quiz' ? (
                  <QuizContent />
                ) : (
                  <PracticeContent 
                    type={activePractice} 
                    studentData={studentData} 
                  />
                )}
              </div>
            </div>

            <div className="submitted-projects">
              <div className="projects-header">
                <h3>Submitted Projects</h3>
                <p>View your completed practice projects</p>
              </div>
              
              <div className="projects-grid">
                {submittedProjects.map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="project-header">
                      <h4>{project.projectName}</h4>
                      <span className="project-type">{project.type}</span>
                    </div>
                    <div className="project-details">
                      <a 
                        href={project.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="github-link"
                      >
                        <i className="fab fa-github"></i>
                        <span>View on GitHub</span>
                      </a>
                    </div>
                    <div className="project-footer">
                      <span className="submission-date">
                        Submitted on: {new Date(project.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {submittedProjects.length === 0 && (
                  <div className="no-projects">
                    <p>No projects submitted yet</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Add the new Courses section */}
          <CourseRecommendations studentData={studentData} />

          {/* Jobs Section */}
          <section id="jobs" className="dashboard-section">
            <h3>Recommended Jobs</h3>
            {studentData?.desiredRole ? (
              <p className="section-subtitle">Showing jobs matching your desired role: {studentData.desiredRole}</p>
            ) : (
              <p className="section-subtitle">Please select your desired role in your profile to see personalized job recommendations</p>
            )}
            <div className="jobs-grid">
              {filteredJobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <h4>{job.title}</h4>
                    <span className="job-type">{job.type}</span>
                  </div>
                  <div className="company-info">
                    <i className="fas fa-building"></i>
                    <span>{job.company}</span>
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{job.location}</span>
                  </div>
                  <div className="salary-info">
                    <i className="fas fa-money-bill-wave"></i>
                    <span>{job.salary}</span>
                  </div>
                  <p className="job-description">{job.description}</p>
                  {job.requirements && (
                    <div className="requirements">
                      <h4>Requirements:</h4>
                      <ul>
                        {job.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="job-tags">
                    {job.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                  <button className="apply-btn">
                    <i className="fas fa-paper-plane"></i>
                    Apply Now
                  </button>
                </div>
              ))}
              {filteredJobs.length === 0 && (
                <div className="no-jobs-message">
                  <p>No jobs found matching your desired role.</p>
                  <p>Try updating your profile with a different role or check back later for new opportunities.</p>
                </div>
              )}
            </div>
          </section>

          {/* Show error message if there's an error */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 