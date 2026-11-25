import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaDownload } from "react-icons/fa";
import "../../styles/Exam.css";

const ExamResultPage = () => {
  const { courseId} = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    navigate(`/course/${courseId}`);
    return null;
  }

  return (
    <div className={`result-page ${result.isPassed ? "passed" : "failed"}`}>
      <div className="result-card">
        <div className="result-icon">
          {result.isPassed ? (
            <FaCheckCircle className="passed-icon" />
          ) : (
            <FaTimesCircle className="failed-icon" />
          )}
        </div>

        <h2>{result.isPassed ? "Congratulations!" : "Exam Failed"}</h2>

        <div className="score-display">Your Score: <span>{result.score}%</span></div>
        <div className="passing-score">Passing Score: 70%</div>

        {result.isPassed ? (
          <>
            <p className="success-message">
              You have successfully passed the exam and earned your certificate!
            </p>
            <button
              className="certificate-btn"
              onClick={() => navigate(`/course/${courseId}/CertificatePage`)}
            >
              <FaDownload /> Download Certificate
            </button>
          </>
        ) : (
          <>
            <p className="retry-message">
              You need to score at least 70% to pass. Please review the course material and try again.
            </p>
            <button
              className="retry-btn"
              onClick={() => navigate(`/course/${courseId}/review`)}
            >
              Review Course
            </button>
          </>
        )}

        <button
          className="back-to-course"
          onClick={() => navigate(`/course/${courseId}`)}
        >
          Back to Course
        </button>
      </div>
    </div>
  );
};

export default ExamResultPage;
