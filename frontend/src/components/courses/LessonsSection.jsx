import { useState } from "react";
import { FaPlay, FaFileAlt, FaDownload, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LessonsSection = ({ course, userProgress, setUserProgress }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const navigate = useNavigate();

  const toggleAccordion = (e) => {
    const header = e.currentTarget;
    const content = header.nextElementSibling;
    const icon = header.querySelector(".accordion-icon");

    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      icon.textContent = "+";
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      icon.textContent = "-";
    }
  };

  const totalLessons =
    course?.syllabus?.reduce(
      (total, section) => total + section.lessons.length,
      0
    ) || 0;

  const startLesson = (lesson) => {
    if (!userProgress.completedLessons.includes(lesson.id)) {
      setUserProgress((prev) => ({
        ...prev,
        completedLessons: [...prev.completedLessons, lesson.id],
      }));
    }
  };

  return (
    <section className="course-section curriculum-section">
      <h2 className="section-title">Course lessons</h2>
      <div className="curriculum-stats">
        <div className="stat-item">
          <span className="stat-number">{course.syllabus?.length || 0}</span>
          <span className="stat-label">Sections</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{totalLessons}</span>
          <span className="stat-label">Lectures</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{course.totalHours}</span>
          <span className="stat-label">Total hours</span>
        </div>
      </div>

      {currentVideo && (
        <div className="video-modal">
          <div className="video-modal-content">
            <button
              className="close-button"
              onClick={() => setCurrentVideo(null)}
            >
              &times;
            </button>
            <h3>{currentVideo.title}</h3>
            <video controls autoPlay className="video-player">
              <source
                src={currentVideo.videoUrl || "/videos/sample.mp4"}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      <div className="syllabus-accordion">
        {course.syllabus?.map((week, index) => (
          <div key={index} className="accordion-item">
            <div className="accordion-header" onClick={toggleAccordion}>
              <div className="header-content">
                <h4 className="week-title">
                  <span className="week-number">Section {index + 1}:</span>{" "}
                  {week.title}
                </h4>
                <div className="lesson-count">
                  {week.lessons.length} lessons •{" "}
                  {week.lessons
                    .reduce((sum, lesson) => {
                      if (lesson.duration?.includes(":")) {
                        const [mins, secs] = lesson.duration
                          .split(":")
                          .map(Number);
                        return sum + mins + secs / 60;
                      }
                      return sum + 5; // Default 5 minutes if duration not specified
                    }, 0)
                    .toFixed(1)}{" "}
                  min
                </div>
              </div>
              <span className="accordion-icon">+</span>
            </div>
            <div className="accordion-content">
              <ul className="lesson-list">
                {week.lessons?.map((lesson, i) => (
                  <li key={i} className="lesson-item">
                    <div className="lesson-type">
                      {lesson.type === "video" ? (
                        <div
                          className="video-thumbnail"
                          onClick={() => {
                            setCurrentVideo(lesson);
                            startLesson(lesson);
                          }}
                        >
                          <FaPlay className="lesson-icon" />
                          {lesson.thumbnail && (
                            <img
                              src={
                                lesson.thumbnail || "/thumbnails/default.jpg"
                              }
                              className="thumbnail-image"
                              alt="Lesson thumbnail"
                            />
                          )}
                        </div>
                      ) : lesson.type === "reading" ? (
                        <FaFileAlt className="lesson-icon" />
                      ) : (
                        <FaDownload className="lesson-icon" />
                      )}
                    </div>
                    <div className="lesson-info">
                      <span className="lesson-title">
                        {lesson.title}
                        {userProgress.completedLessons.includes(lesson.id) && (
                          <FaCheck className="completed-icon" />
                        )}
                      </span>
                      {lesson.duration && (
                        <span className="lesson-duration">
                          {lesson.duration}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <button
        className="start-exam-btn"
        onClick={() => navigate(`/course/${course.id}/exam`)}
      >
        Take Final Exam
      </button>
      {userProgress.completedLessons.length === totalLessons && (
        <button
          className="start-exam-btn"
          onClick={() => navigate(`/course/${course.id}/exam`)}
        >
          Take Final Exam
        </button>
      )}
    </section>
  );
};

export default LessonsSection;
