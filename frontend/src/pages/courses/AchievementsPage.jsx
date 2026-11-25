import { useParams, useNavigate } from "react-router-dom";
import { FaCheck, FaLock, FaStar, FaAward } from "react-icons/fa";
import Header from "../../components/layout/Header";
import "../../styles/AchievementsPage.css";

const AchievementsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // In a real app, this data would come from the backend
  const courseProgress = {
    enrolled: true,
    completedLessons: 15,
    totalLessons: 20,
    completedQuizzes: 3,
    totalQuizzes: 4,
    finalExamPassed: true,
    feedbackGiven: true,
    certificateEarned: true,
  };

  const calculateProgress = (completed, total) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="achievements-page">
      <Header />
      <div className="container">
        <h1>Your Course Achievements</h1>

        <div className="achievement-summary">
          <div className="summary-card total-progress">
            <h3>Overall Progress</h3>
            <div className="progress-circle">
              <svg>
                <circle className="bg" cx="70" cy="70" r="60"></circle>
                <circle
                  className="progress"
                  cx="70"
                  cy="70"
                  r="60"
                  style={{
                    strokeDashoffset:
                      440 -
                      (440 *
                        calculateProgress(
                          courseProgress.completedLessons +
                            courseProgress.completedQuizzes +
                            (courseProgress.finalExamPassed ? 1 : 0),
                          courseProgress.totalLessons +
                            courseProgress.totalQuizzes +
                            1
                        )) /
                        100,
                  }}
                ></circle>
              </svg>
              <div className="progress-text">
                {calculateProgress(
                  courseProgress.completedLessons +
                    courseProgress.completedQuizzes +
                    (courseProgress.finalExamPassed ? 1 : 0),
                  courseProgress.totalLessons + courseProgress.totalQuizzes + 1
                )}
                %
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h3>Completed Lessons</h3>
            <div className="progress-number">
              {courseProgress.completedLessons}/{courseProgress.totalLessons}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${calculateProgress(
                    courseProgress.completedLessons,
                    courseProgress.totalLessons
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="summary-card">
            <h3>Completed Quizzes</h3>
            <div className="progress-number">
              {courseProgress.completedQuizzes}/{courseProgress.totalQuizzes}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${calculateProgress(
                    courseProgress.completedQuizzes,
                    courseProgress.totalQuizzes
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="achievement-milestones">
          <h2>Learning Milestones</h2>
          <div className="milestones-grid">
            <div
              className={`milestone-card ${
                courseProgress.enrolled ? "completed" : ""
              }`}
            >
              <div className="milestone-icon">
                {courseProgress.enrolled ? <FaCheck /> : <FaLock />}
              </div>
              <h3>Course Enrollment</h3>
              <p>First step in your learning journey</p>
              {courseProgress.enrolled && (
                <span className="completion-date">Completed on 03/15/2023</span>
              )}
            </div>

            <div
              className={`milestone-card ${
                courseProgress.completedLessons === courseProgress.totalLessons
                  ? "completed"
                  : ""
              }`}
            >
              <div className="milestone-icon">
                {courseProgress.completedLessons ===
                courseProgress.totalLessons ? (
                  <FaCheck />
                ) : (
                  <FaLock />
                )}
              </div>
              <h3>Complete All Lessons</h3>
              <p>Demonstrate learning commitment</p>
              {courseProgress.completedLessons ===
                courseProgress.totalLessons && (
                <span className="completion-date">Completed on 03/22/2023</span>
              )}
            </div>

            <div
              className={`milestone-card ${
                courseProgress.completedQuizzes === courseProgress.totalQuizzes
                  ? "completed"
                  : ""
              }`}
            >
              <div className="milestone-icon">
                {courseProgress.completedQuizzes ===
                courseProgress.totalQuizzes ? (
                  <FaCheck />
                ) : (
                  <FaLock />
                )}
              </div>
              <h3>Pass All Quizzes</h3>
              <p>Test your understanding and skills</p>
              {courseProgress.completedQuizzes ===
                courseProgress.totalQuizzes && (
                <span className="completion-date">Completed on 03/25/2023</span>
              )}
            </div>

            <div
              className={`milestone-card ${
                courseProgress.finalExamPassed ? "completed" : ""
              }`}
            >
              <div className="milestone-icon">
                {courseProgress.finalExamPassed ? <FaStar /> : <FaLock />}
              </div>
              <h3>Pass Final Exam</h3>
              <p>Demonstrate content mastery</p>
              {courseProgress.finalExamPassed && (
                <span className="completion-date">Completed on 03/28/2023</span>
              )}
            </div>

            <div
              className={`milestone-card ${
                courseProgress.feedbackGiven ? "completed" : ""
              }`}
            >
              <div className="milestone-icon">
                {courseProgress.feedbackGiven ? <FaCheck /> : <FaLock />}
              </div>
              <h3>Course Feedback</h3>
              <p>Share your experience</p>
              {courseProgress.feedbackGiven && (
                <span className="completion-date">Completed on 03/29/2023</span>
              )}
            </div>

            <div
              className={`milestone-card ${
                courseProgress.certificateEarned ? "completed" : ""
              }`}
            >
              <div className="milestone-icon">
                {courseProgress.certificateEarned ? <FaAward /> : <FaLock />}
              </div>
              <h3>Earn Certificate</h3>
              <p>Proof of achievement</p>
              {courseProgress.certificateEarned && (
                <span className="completion-date">Completed on 03/30/2023</span>
              )}
            </div>
          </div>
        </div>

        {courseProgress.certificateEarned && (
          <div className="certificate-cta">
            <h2>Congratulations! You&apos;ve completed all course requirements</h2>
            <button
              className="view-certificate-btn"
              onClick={() => navigate(`/course/${id}/CertificatePage`)}
            >
              View Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
