import React from 'react';
import './CourseProgress.css';

function CourseProgress({ course, progress, onUpdateProgress }) {
  // Calculate percentage completed for each section
  const calculateSectionProgress = () => {
    const totalSections = course.syllabus.length;
    const completedSections = Math.floor((progress / 100) * totalSections);
    return course.syllabus.map((section, index) => ({
      name: section,
      completed: index < completedSections,
      current: index === completedSections
    }));
  };

  const sections = calculateSectionProgress();

  const handleToggleComplete = (index) => {
    const newProgress = Math.round(((index + 1) / course.syllabus.length) * 100);
    onUpdateProgress(course.id, newProgress);
  };

  return (
    <div className="course-progress">
      <div className="progress-header">
        <h4>Course Progress</h4>
        <span className="progress-percentage">{progress}% Complete</span>
      </div>

      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="syllabus-progress">
        {sections.map((section, index) => (
          <div 
            key={index} 
            className={`syllabus-item ${section.completed ? 'completed' : ''} ${section.current ? 'current' : ''}`}
          >
            <div className="section-info">
              <span className="section-name">{section.name}</span>
              <span className="section-status">
                {section.completed ? 'Completed' : section.current ? 'In Progress' : 'Upcoming'}
              </span>
            </div>
            <button 
              className={`tick-button ${section.completed ? 'completed' : ''}`}
              onClick={() => handleToggleComplete(index)}
              disabled={section.completed}
            >
              <i className="fas fa-check"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseProgress; 