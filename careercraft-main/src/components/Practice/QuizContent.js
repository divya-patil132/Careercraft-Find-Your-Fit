import React, { useState } from 'react';
import './QuizContent.css';

const frontendQuiz = [
  {
    id: 1,
    question: "What is the purpose of React's Virtual DOM?",
    options: [
      "To improve performance by minimizing direct DOM manipulation",
      "To create virtual reality interfaces",
      "To handle server-side rendering",
      "To manage database operations"
    ],
    correctAnswer: 0,
    skill: "React"
  },
  {
    id: 2,
    question: "Which CSS property is used to create a responsive grid layout?",
    options: [
      "display: flex",
      "display: grid",
      "display: table",
      "display: block"
    ],
    correctAnswer: 1,
    skill: "CSS"
  },
  {
    id: 3,
    question: "What is the difference between '==' and '===' in JavaScript?",
    options: [
      "There is no difference",
      "'==' checks value and type, '===' checks only value",
      "'==' checks only value, '===' checks value and type",
      "They are used for different data types"
    ],
    correctAnswer: 2,
    skill: "JavaScript"
  },
  {
    id: 4,
    question: "Which HTML5 element is used for playing video files?",
    options: [
      "<media>",
      "<video>",
      "<movie>",
      "<play>"
    ],
    correctAnswer: 1,
    skill: "HTML"
  },
  {
    id: 5,
    question: "What is the purpose of the 'useEffect' hook in React?",
    options: [
      "To create special effects in the UI",
      "To handle side effects in functional components",
      "To improve component performance",
      "To manage state in components"
    ],
    correctAnswer: 1,
    skill: "React"
  },
  {
    id: 6,
    question: "Which CSS selector has the highest specificity?",
    options: [
      "Class selector (.class)",
      "ID selector (#id)",
      "Element selector (div)",
      "Universal selector (*)"
    ],
    correctAnswer: 1,
    skill: "CSS"
  },
  {
    id: 7,
    question: "What is the output of console.log(typeof [])?",
    options: [
      "array",
      "object",
      "undefined",
      "null"
    ],
    correctAnswer: 1,
    skill: "JavaScript"
  },
  {
    id: 8,
    question: "Which HTML attribute is used to define inline styles?",
    options: [
      "class",
      "style",
      "css",
      "design"
    ],
    correctAnswer: 1,
    skill: "HTML"
  },
  {
    id: 9,
    question: "What is the purpose of React's Context API?",
    options: [
      "To manage global state without prop drilling",
      "To handle API requests",
      "To create context menus",
      "To manage routing"
    ],
    correctAnswer: 0,
    skill: "React"
  },
  {
    id: 10,
    question: "Which CSS property is used to change the text color?",
    options: [
      "text-color",
      "font-color",
      "color",
      "text-style"
    ],
    correctAnswer: 2,
    skill: "CSS"
  },
  {
    id: 11,
    question: "What is the difference between let and const in JavaScript?",
    options: [
      "let is for strings, const is for numbers",
      "let can be reassigned, const cannot be reassigned",
      "let is global, const is local",
      "There is no difference"
    ],
    correctAnswer: 1,
    skill: "JavaScript"
  },
  {
    id: 12,
    question: "Which HTML tag is used to create a hyperlink?",
    options: [
      "<link>",
      "<a>",
      "<href>",
      "<url>"
    ],
    correctAnswer: 1,
    skill: "HTML"
  },
  {
    id: 13,
    question: "What is the purpose of React's useState hook?",
    options: [
      "To create state in class components",
      "To manage state in functional components",
      "To handle API calls",
      "To manage routing"
    ],
    correctAnswer: 1,
    skill: "React"
  },
  {
    id: 14,
    question: "Which CSS property is used to specify the space between lines of text?",
    options: [
      "line-height",
      "text-spacing",
      "line-spacing",
      "text-height"
    ],
    correctAnswer: 0,
    skill: "CSS"
  },
  {
    id: 15,
    question: "What is the output of console.log(0.1 + 0.2)?",
    options: [
      "0.3",
      "0.30000000000000004",
      "0.31",
      "Error"
    ],
    correctAnswer: 1,
    skill: "JavaScript"
  },
  {
    id: 16,
    question: "Which HTML element is used to create a form?",
    options: [
      "<input>",
      "<form>",
      "<fieldset>",
      "<button>"
    ],
    correctAnswer: 1,
    skill: "HTML"
  },
  {
    id: 17,
    question: "What is the purpose of React's useRef hook?",
    options: [
      "To create references to DOM elements or values that persist between renders",
      "To handle API calls",
      "To manage routing",
      "To create special effects"
    ],
    correctAnswer: 0,
    skill: "React"
  },
  {
    id: 18,
    question: "Which CSS property is used to make text bold?",
    options: [
      "text-weight",
      "font-weight",
      "text-style",
      "font-style"
    ],
    correctAnswer: 1,
    skill: "CSS"
  },
  {
    id: 19,
    question: "What is the purpose of the 'this' keyword in JavaScript?",
    options: [
      "To refer to the current function",
      "To refer to the current object",
      "To create a new instance",
      "To define a class"
    ],
    correctAnswer: 1,
    skill: "JavaScript"
  },
  {
    id: 20,
    question: "Which HTML element is used to define a table row?",
    options: [
      "<tr>",
      "<td>",
      "<th>",
      "<table>"
    ],
    correctAnswer: 0,
    skill: "HTML"
  }
];

const QuizContent = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [skillScores, setSkillScores] = useState({
    React: 0,
    CSS: 0,
    JavaScript: 0,
    HTML: 0
  });

  const handleAnswerClick = (selectedOption) => {
    const currentQuizItem = frontendQuiz[currentQuestion];
    
    if (selectedOption === currentQuizItem.correctAnswer) {
      setScore(score + 1);
      setSkillScores(prev => ({
        ...prev,
        [currentQuizItem.skill]: prev[currentQuizItem.skill] + 1
      }));
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < frontendQuiz.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSkillScores({
      React: 0,
      CSS: 0,
      JavaScript: 0,
      HTML: 0
    });
  };

  return (
    <div className="quiz-container">
      {showScore ? (
        <div className="score-section">
          <h2>Quiz Completed!</h2>
          <div className="score-details">
            <p>Your total score: {score} out of {frontendQuiz.length}</p>
            <div className="skill-scores">
              <h3>Skill-wise Performance:</h3>
              {Object.entries(skillScores).map(([skill, score]) => (
                <div key={skill} className="skill-score-item">
                  <span className="skill-name">{skill}:</span>
                  <div className="skill-progress">
                    <div 
                      className="skill-progress-bar"
                      style={{ width: `${(score / frontendQuiz.filter(q => q.skill === skill).length) * 100}%` }}
                    />
                  </div>
                  <span className="skill-score">{score}/{frontendQuiz.filter(q => q.skill === skill).length}</span>
                </div>
              ))}
            </div>
          </div>
          <button className="reset-btn" onClick={resetQuiz}>
            Try Again
          </button>
        </div>
      ) : (
        <div className="question-section">
          <div className="question-count">
            <span>Question {currentQuestion + 1}</span>/{frontendQuiz.length}
          </div>
          <div className="question-text">
            {frontendQuiz[currentQuestion].question}
          </div>
          <div className="answer-section">
            {frontendQuiz[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                className="answer-button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizContent; 