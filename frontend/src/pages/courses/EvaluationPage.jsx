import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import { FaCheck } from "react-icons/fa";
import "../../styles/EvaluationPage.css";

const quizzes = [
  {
    id: 1,
    title: "Basic Concepts Quiz",
    questions: 10,
    completed: false,
    score: null,
  },
  {
    id: 2,
    title: "Advanced Techniques Quiz",
    questions: 15,
    completed: false,
    score: null,
  },
];

const lessons = [
  { id: 1, title: "Introduction", completed: true },
  { id: 2, title: "Intermediate Concepts", completed: true },
  { id: 3, title: "Advanced Topics", completed: true },
];

const EvaluationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizzesList, setQuizzesList] = useState(quizzes);
  const [finalExamCompleted, setFinalExamCompleted] = useState(false);
  const [feedbackGiven] = useState(false);

  useEffect(() => {
    const allLessonsCompleted = lessons.every((lesson) => lesson.completed);
    const allQuizzesCompleted = quizzesList.every(
      (q) => q.completed && q.score >= 70
    );

    if (!allLessonsCompleted || !allQuizzesCompleted) {
      navigate(`/course/${id}`, {
        state: {
          message: "Complete all lessons and quizzes before final exam",
        },
      });
    }
  }, [quizzesList, id, navigate]);

  const handleQuizStart = (quizId) => {
    alert(`Starting quiz ${quizId}`);
    const updatedQuizzes = quizzesList.map((q) =>
      q.id === quizId
        ? { ...q, completed: true, score: Math.floor(Math.random() * 31) + 70 }
        : q
    );
    setQuizzesList(updatedQuizzes);
  };

  const handleFinalExam = () => {
    setFinalExamCompleted(true);
  };

  const viewCertificate = () => {
    navigate(`/CertificatePage/${id}`);
  };

  return (
    <div className="evaluation-page">
      <Header />
      <div className="container">
        <h1>Course Evaluation</h1>

        <section className="quizzes-section">
          <h2>Quizzes</h2>
          <div className="quizzes-list">
            {quizzesList.map((quiz) => (
              <div key={quiz.id} className="quiz-card">
                <div className="quiz-info">
                  <h3>{quiz.title}</h3>
                  <p>{quiz.questions} questions</p>
                  {quiz.completed && (
                    <p className="score">Score: {quiz.score}%</p>
                  )}
                </div>
                <button
                  onClick={() => handleQuizStart(quiz.id)}
                  disabled={quiz.completed}
                >
                  {quiz.completed ? "Completed" : "Start Quiz"}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="final-exam-section">
          <h2>Final Exam</h2>
          <div className={`exam-card ${finalExamCompleted ? "completed" : ""}`}>
            <div className="exam-info">
              <h3>Course Final Exam</h3>
              <p>Comprehensive test covering all course materials</p>
              {finalExamCompleted && !feedbackGiven && (
                <p className="eligibility">
                  Please rate the course to unlock your certificate.
                </p>
              )}
              {feedbackGiven && (
                <p className="eligibility">
                  You are eligible for a certificate!
                </p>
              )}
            </div>
            <button onClick={handleFinalExam} disabled={finalExamCompleted}>
              {finalExamCompleted ? "Exam Completed" : "Take Final Exam"}
            </button>
          </div>
        </section>

        {feedbackGiven && (
          <div className="certificate-eligibility">
            <h3>🎉 Congratulations! You&apos;ve completed all requirements</h3>
            <p>Course completion requirements:</p>
            <ul className="requirements-list">
              <li>
                <FaCheck className="check-icon" /> Watched all lessons
              </li>
              <li>
                <FaCheck className="check-icon" /> Passed all quizzes (min 70%)
              </li>
              <li>
                <FaCheck className="check-icon" /> Passed final exam
              </li>
              <li>
                <FaCheck className="check-icon" /> Submitted course feedback
              </li>
            </ul>
            <button onClick={viewCertificate} className="view-certificate-btn">
              View Your Certificate
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};
export default EvaluationPage;
