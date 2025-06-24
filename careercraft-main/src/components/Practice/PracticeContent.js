import React, { useState, useEffect, useContext } from 'react';
import './PracticeContent.css';
import { db } from '../../firebase/firebase.config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';

const PracticeContent = ({ type, studentData }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useContext(AuthContext);

  const loadExistingContent = async () => {
    if (!user?.email || !studentData?.email) {
      setLoading(false);
      setError('Please log in to view practice content.');
      return;
    }

    if (user.email !== studentData.email) {
      setLoading(false);
      setError('You can only view your own practice content.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const practiceRef = collection(db, 'practice');
      const q = query(
        practiceRef,
        where('studentEmail', '==', user.email),
        where('type', '==', type),
        where('isCompleted', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const practiceDoc = querySnapshot.docs[0];
        setContent({
          id: practiceDoc.id,
          ...practiceDoc.data()
        });
        setIsSubmitted(false);
      } else {
        setContent(null);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading practice content:', err);
      setError('Error loading content. Please try again later.');
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (!user?.email || !studentData?.email) {
      setError('Please log in to generate content.');
      return;
    }

    if (user.email !== studentData.email) {
      setError('You can only generate content for your own account.');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      // Check for existing incomplete challenge
      const practiceRef = collection(db, 'practice');
      const q = query(
        practiceRef,
        where('studentEmail', '==', user.email),
        where('type', '==', type),
        where('isCompleted', '==', false)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError('Please complete your existing challenge first.');
        setGenerating(false);
        return;
      }

      // Generate new content
      const newContent = {
        studentEmail: user.email,
        type: type,
        timestamp: new Date().toISOString(),
        isCompleted: false,
        content: type === 'Coding Challenge' 
          ? generateCodingChallenge(studentData.programmingLanguages)
          : generateMiniProject(studentData.programmingLanguages, studentData.frameworks),
      };

      const docRef = await addDoc(practiceRef, newContent);
      setContent({ id: docRef.id, ...newContent });
      setIsSubmitted(false);
      setError(null);
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Error generating content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGithubLinkSubmit = async () => {
    if (!user?.email || !content?.id) {
      setError('Please log in to submit your project.');
      return;
    }

    if (user.email !== studentData.email) {
      setError('You can only submit projects for your own account.');
      return;
    }

    if (!githubLink || !projectName) {
      setError('Please provide both project name and GitHub link.');
      return;
    }

    try {
      const practiceRef = doc(db, 'practice', content.id);
      await updateDoc(practiceRef, {
        isCompleted: true,
        githubLink: githubLink,
        projectName: projectName,
        lastUpdated: new Date().toISOString()
      });

      setIsSubmitted(true);
      setError(null);
    } catch (err) {
      console.error('Error submitting project:', err);
      setError('Error submitting project. Please try again.');
    }
  };

  useEffect(() => {
    loadExistingContent();
  }, [type, studentData?.email, user?.email]);

  const generateCodingChallenge = (languages) => {
    // Generate a coding challenge based on user's programming languages
    const language = languages[0] || 'JavaScript';
    return `
      Coding Challenge: Array Manipulation
      
      Language: ${language}
      
      Problem:
      Write a function that takes an array of integers and returns the maximum sum of any contiguous subarray within the input array.
      
      Example:
      Input: [-2, 1, -3, 4, -1, 2, 1, -5, 4]
      Output: 6
      Explanation: The contiguous subarray [4, -1, 2, 1] has the maximum sum of 6.
      
      Requirements:
      1. Implement the solution using ${language}
      2. Include comments explaining your approach
      3. Consider edge cases (empty array, all negative numbers)
      4. Optimize for time and space complexity
      
      Bonus:
      - Can you solve it in O(n) time complexity?
      - Can you handle an array with all negative numbers correctly?
    `;
  };

  const generateMiniProject = (languages, frameworks) => {
    // Generate a mini project based on user's skills
    const language = languages[0] || 'JavaScript';
    const framework = frameworks[0] || 'React';
    return `
      Mini Project: Task Management Dashboard
      
      Technology Stack:
      - Frontend: ${framework}
      - Language: ${language}
      
      Project Description:
      Create a simple task management dashboard where users can:
      1. Add new tasks with title, description, and due date
      2. Mark tasks as complete
      3. Filter tasks by status (complete/incomplete)
      4. Sort tasks by due date
      
      Requirements:
      1. Use ${framework} for the frontend
      2. Implement responsive design
      3. Store tasks in local storage
      4. Include basic error handling
      5. Add simple animations for better UX
      
      Bonus Features:
      - Add task categories/tags
      - Implement task search functionality
      - Add drag-and-drop for task reordering
      
      Evaluation Criteria:
      - Code organization and clarity
      - UI/UX design
      - Implementation of required features
      - Proper error handling
      - Code documentation
    `;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="content-card">
        <div className="content-header">
          <h3>{type}</h3>
          <button 
            className="generate-btn"
            onClick={generateContent}
            disabled={generating}
          >
            {generating ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt"></i>
                Generate New
              </>
            )}
          </button>
        </div>
        
        <div className="content-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {content ? (
            <div className="content-text">
              <pre>{content.content}</pre>
            </div>
          ) : (
            <div className="no-content">
              <p>No active {type.toLowerCase()} available.</p>
              <p>Click the Generate button to create a new one!</p>
            </div>
          )}

          {content && !isSubmitted ? (
            <div className="submission-form">
              <div className="form-group">
                <label htmlFor="projectName">Project Name</label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter your project name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="githubLink">GitHub Repository Link</label>
                <input
                  type="url"
                  id="githubLink"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  placeholder="Enter your GitHub repository link"
                />
              </div>
              <button 
                className="submit-btn"
                onClick={handleGithubLinkSubmit}
                disabled={!githubLink || !projectName}
              >
                <i className="fas fa-check"></i>
                Submit Project
              </button>
            </div>
          ) : null}

          {isSubmitted && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <p>Project submitted successfully!</p>
              <p>Generate a new challenge when you're ready for more practice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeContent;