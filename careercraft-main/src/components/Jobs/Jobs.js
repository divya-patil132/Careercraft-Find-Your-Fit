import React from 'react';
import './Jobs.css';
import { jobsData } from '../../data/jobsData';

const Jobs = ({ studentData }) => {
  // Filter jobs based on student's desired role
  const filteredJobs = studentData?.desiredRole
    ? jobsData.filter(job => {
        const jobTitle = job.title.toLowerCase();
        const desiredRole = studentData.desiredRole.toLowerCase();
        return jobTitle.includes(desiredRole) || 
               job.tags.some(tag => tag.toLowerCase().includes(desiredRole));
      })
    : jobsData;

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h2>Recommended Jobs</h2>
        {studentData?.desiredRole && (
          <p>Showing jobs matching your desired role: <strong>{studentData.desiredRole}</strong></p>
        )}
      </div>
      <div className="jobs-grid">
        {filteredJobs.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <h3>{job.title}</h3>
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

            <div className="requirements">
              <h4>Requirements:</h4>
              <ul>
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

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
          <div className="no-jobs">
            <p>No jobs found matching your desired role.</p>
            <p>Try updating your profile or exploring other roles.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs; 