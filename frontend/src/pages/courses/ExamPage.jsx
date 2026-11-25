import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaClock, FaCheckCircle } from "react-icons/fa";
import "../../styles/Exam.css";

const ExamPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 min
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // C# Exam Questions
    const mockExam = {
      examId: `csharp-exam-${courseId}`,
      title: "C# Basics Final Exam",
      questions: [
        {
          questionText: "Which of the following is the correct way to declare a variable in C#?",
          options: ["int number = \"5\";", "int number = 5;", "number int = 5;", "declare int number = 5;"],
          correctIndex: 1,
        },
        {
          questionText: "What is the default value of a bool variable in C#?",
          options: ["true", "null", "0", "false"],
          correctIndex: 3,
        },
        {
          questionText: "Which keyword is used to create an object in C#?",
          options: ["create", "new", "object", "instance"],
          correctIndex: 1,
        },
        {
          questionText: "What is the output of:\nint x = 5;\nint y = x++;\nConsole.WriteLine(y);",
          options: ["6", "5", "0", "Compiler error"],
          correctIndex: 1,
        },
        {
          questionText: "Which of these is NOT a value type in C#?",
          options: ["int", "double", "string", "char"],
          correctIndex: 2,
        },
      ],
    };

    setExam(mockExam);
    setAnswers(new Array(mockExam.questions.length).fill(null));

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [courseId]);

  // Auto-submit when time runs out. A ref keeps the latest handler, so it sees the
  // current answers (the old interval captured the first render, so it never fired).
  const submitRef = useRef(null);
  useEffect(() => {
    if (timeLeft === 0 && exam && !isSubmitting) submitRef.current?.();
  }, [timeLeft, exam, isSubmitting]);

  const handleAnswerSelect = (qIndex, optionIndex) => {
    const updated = [...answers];
    updated[qIndex] = optionIndex;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    await new Promise((res) => setTimeout(res, 1000));

    const correctCount = exam.questions.reduce((acc, q, i) => {
      return acc + (answers[i] === q.correctIndex ? 1 : 0);
    }, 0);

    const scorePercentage = Math.round((correctCount / exam.questions.length) * 100);
    const isPassed = scorePercentage >= 70;

    navigate(`/course/${courseId}/exam/result`, {
      state: {
        result: {
          score: scorePercentage,
          totalQuestions: exam.questions.length,
          correctAnswers: answers.map((a, i) => a === exam.questions[i].correctIndex),
          timeSpent: 1800 - timeLeft,
          isPassed,
        },
      },
    });
  };

  submitRef.current = handleSubmit;

  const formatTime = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!exam) return <div className="loading">Loading exam...</div>;

  return (
    <div className="exam-page">
      <div className="exam-header">
        <h2>{exam.title}</h2>
        <div className="timer"><FaClock /> Time left: {formatTime(timeLeft)}</div>
      </div>

      <div className="exam-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(answers.filter((a) => a !== null).length / exam.questions.length) * 100}%`,
            }}
          />
        </div>
        <span>
          Answered: {answers.filter((a) => a !== null).length}/{exam.questions.length}
        </span>
      </div>

      <div className="questions-container">
        {exam.questions.map((q, qIndex) => (
          <div key={qIndex} className="question-card">
            <h3>Question {qIndex + 1}: {q.questionText}</h3>
            <div className="options">
              {q.options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className={`option ${answers[qIndex] === oIndex ? "selected" : ""}`}
                  onClick={() => handleAnswerSelect(qIndex, oIndex)}
                >
                  <div className="option-letter">{String.fromCharCode(65 + oIndex)}</div>
                  <div className="option-text">{option}</div>
                  {answers[qIndex] === oIndex && (
                    <div className="option-check"><FaCheckCircle /></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="exam-footer">
        <button
          className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
          onClick={handleSubmit}
          disabled={isSubmitting || answers.every((a) => a === null)}
        >
          {isSubmitting ? "Submitting..." : "Submit Exam"}
        </button>
      </div>
    </div>
  );
};

export default ExamPage;
