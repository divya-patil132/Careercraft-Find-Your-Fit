import React, { useState, useEffect } from 'react';
import './CourseRecommendations.css';
import { db, auth } from '../../firebase/firebase.config';
import { collection, addDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { coursesData } from '../../data/coursesData';
import CourseProgress from '../CourseProgress/CourseProgress';

function CourseRecommendations({ studentData }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedCourses, setAppliedCourses] = useState([]);
  const [error, setError] = useState(null);
  const [courseProgress, setCourseProgress] = useState({});

  useEffect(() => {
    const fetchCourses = () => {
      try {
        setLoading(true);
        
        const studentSkills = studentData.programmingLanguages.map(skill => skill.toLowerCase());
        const desiredRole = studentData.desiredRole?.toLowerCase() || '';

        // First, filter courses that match the desired role
        const roleMatchedCourses = coursesData.filter(course => 
          course.jobRoles.some(role => 
            role.toLowerCase().includes(desiredRole) || 
            desiredRole.includes(role.toLowerCase())
          )
        );

        // Then, filter remaining courses based on skills
        const skillMatchedCourses = coursesData.filter(course => {
          if (roleMatchedCourses.includes(course)) return false; // Skip if already in role matches
          return course.requiredSkills.some(skill => 
            studentSkills.includes(skill.toLowerCase())
          );
        });

        // Combine and sort courses
        const allCourses = [
          ...roleMatchedCourses,
          ...skillMatchedCourses
        ];

        setCourses(allCourses);
        setError(null);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [studentData]);

  useEffect(() => {
    const fetchAppliedCourses = async () => {
      if (!auth.currentUser) return; // Check if user is authenticated

      try {
        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, where("studentEmail", "==", studentData.email));
        const querySnapshot = await getDocs(q);
        
        const appliedCourseIds = querySnapshot.docs.map(doc => doc.data().courseId);
        setAppliedCourses(appliedCourseIds);

        const progressData = {};
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          progressData[data.courseId] = data.progress || 0;
        });
        setCourseProgress(progressData);
      } catch (error) {
        console.error("Error fetching applied courses:", error);
        // Handle error gracefully
        setError("Failed to load your enrolled courses. Please try again later.");
      }
    };

    if (studentData.email) {
      fetchAppliedCourses();
    }
  }, [studentData.email]);

  const handleApply = async (courseId) => {
    if (!auth.currentUser) {
      alert('Please log in to apply for courses');
      return;
    }

    try {
      const applicationRef = collection(db, 'applications');
      const selectedCourse = courses.find(course => course.id === courseId);
      
      const applicationData = {
        courseId,
        courseTitle: selectedCourse.title,
        courseDuration: selectedCourse.duration,
        coursePrice: selectedCourse.price,
        studentEmail: auth.currentUser.email, // Use authenticated user's email
        studentName: studentData.name,
        appliedAt: new Date().toISOString(),
        status: 'pending',
        progress: 0,
        syllabus: selectedCourse.syllabus
      };

      await addDoc(applicationRef, applicationData);

      setAppliedCourses(prev => [...prev, courseId]);
      setCourseProgress(prev => ({
        ...prev,
        [courseId]: 0
      }));

      alert('Course application submitted successfully!');
    } catch (error) {
      console.error("Error applying for course:", error);
      alert('Failed to submit application. Please try again.');
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

        // Update local state
        setCourseProgress(prev => ({
          ...prev,
          [courseId]: newProgress
        }));
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      setError("Failed to update course progress. Please try again.");
    }
  };

  if (loading) {
    return (
      <section id="courses" className="dashboard-section">
        <h3>Recommended Courses</h3>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Finding the best courses for you...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="dashboard-section">
      <h3>Recommended Courses</h3>
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="courses-filter-info">
            {studentData.desiredRole && (
              <p className="role-filter">Showing courses for: <strong>{studentData.desiredRole}</strong></p>
            )}
            {studentData.programmingLanguages.length > 0 && (
              <p className="skills-filter">Matching skills: {studentData.programmingLanguages.join(', ')}</p>
            )}
          </div>

          <div className="courses-container">
            {courses.length > 0 ? (
              <>
                {/* Role-matched courses */}
                {studentData.desiredRole && (
                  <div className="course-section">
                    <h4 className="section-title">Recommended for {studentData.desiredRole}</h4>
                    <div className="course-grid">
                      {courses
                        .filter(course => 
                          course.jobRoles.some(role => 
                            role.toLowerCase().includes(studentData.desiredRole.toLowerCase())
                          )
                        )
                        .map(course => (
                          <div key={course.id} className="course-card role-matched">
                            <div className="role-match-badge">
                              Matches Your Career Goal
                            </div>
                            <div className="course-header">
                              <h4>{course.title}</h4>
                              <span className="course-level">{course.level}</span>
                            </div>
                            
                            <p className="course-description">{course.description}</p>
                            
                            <div className="course-details">
                              <div className="detail-item">
                                <span className="label">Instructor:</span>
                                <span>{course.instructor}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Duration:</span>
                                <span>{course.duration}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Price:</span>
                                <span>{course.price}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Rating:</span>
                                <span>⭐ {course.rating} ({course.students} students)</span>
                              </div>
                            </div>

                            <div className="skills-required">
                              <h5>Required Skills:</h5>
                              <div className="skills-tags">
                                {course.requiredSkills.map((skill, index) => (
                                  <span 
                                    key={index} 
                                    className={`skill-tag ${studentData.programmingLanguages.map(s => s.toLowerCase()).includes(skill.toLowerCase()) ? 'matched' : ''}`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="syllabus-preview">
                              <h5>Course Content:</h5>
                              <ul>
                                {course.syllabus.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            {appliedCourses.includes(course.id) && (
                              <div className="applied-course-progress">
                                <CourseProgress 
                                  course={course}
                                  progress={courseProgress[course.id] || 0}
                                  onUpdateProgress={updateCourseProgress}
                                />
                              </div>
                            )}

                            <button
                              className={`apply-btn ${appliedCourses.includes(course.id) ? 'applied' : ''}`}
                              onClick={() => handleApply(course.id)}
                              disabled={appliedCourses.includes(course.id)}
                            >
                              {appliedCourses.includes(course.id) ? (
                                <>
                                  <i className="fas fa-check"></i> Enrolled
                                </>
                              ) : (
                                'Apply Now'
                              )}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Skill-matched courses */}
                <div className="course-section">
                  <h4 className="section-title">Based on Your Skills</h4>
                  <div className="course-grid">
                    {courses
                      .filter(course => 
                        !course.jobRoles.some(role => 
                          role.toLowerCase().includes(studentData.desiredRole.toLowerCase())
                        )
                      )
                      .map(course => (
                        <div key={course.id} className="course-card">
                          <div className="course-header">
                            <h4>{course.title}</h4>
                            <span className="course-level">{course.level}</span>
                          </div>
                          
                          <p className="course-description">{course.description}</p>
                          
                          <div className="course-details">
                            <div className="detail-item">
                              <span className="label">Instructor:</span>
                              <span>{course.instructor}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Duration:</span>
                              <span>{course.duration}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Price:</span>
                              <span>{course.price}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label">Rating:</span>
                              <span>⭐ {course.rating} ({course.students} students)</span>
                            </div>
                          </div>

                          <div className="skills-required">
                            <h5>Required Skills:</h5>
                            <div className="skills-tags">
                              {course.requiredSkills.map((skill, index) => (
                                <span 
                                  key={index} 
                                  className={`skill-tag ${studentData.programmingLanguages.map(s => s.toLowerCase()).includes(skill.toLowerCase()) ? 'matched' : ''}`}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="syllabus-preview">
                            <h5>Course Content:</h5>
                            <ul>
                              {course.syllabus.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          {appliedCourses.includes(course.id) && (
                            <div className="applied-course-progress">
                              <CourseProgress 
                                course={course}
                                progress={courseProgress[course.id] || 0}
                                onUpdateProgress={updateCourseProgress}
                              />
                            </div>
                          )}

                          <button
                            className={`apply-btn ${appliedCourses.includes(course.id) ? 'applied' : ''}`}
                            onClick={() => handleApply(course.id)}
                            disabled={appliedCourses.includes(course.id)}
                          >
                            {appliedCourses.includes(course.id) ? (
                              <>
                                <i className="fas fa-check"></i> Enrolled
                              </>
                            ) : (
                              'Apply Now'
                            )}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-courses">
                <p>No courses match your profile at the moment.</p>
                <p>Try updating your skills or desired job role to see more recommendations.</p>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default CourseRecommendations;