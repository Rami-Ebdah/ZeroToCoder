import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaStar,
  FaUserGraduate,
  FaClock,
  FaChalkboardTeacher,
  FaCheck,
  FaPlay,
  FaFileAlt,
  FaDownload,
  FaMobileAlt,
  FaCertificate,
  FaMedal,
} from "react-icons/fa";
import { MdOutlineSell } from "react-icons/md";
import Header from "../../components/layout/Header";
import "../../styles/CourseDetails.css";
import LessonsSection from "../../components/courses/LessonsSection";
import ReviewsSection from "../../components/courses/ReviewsSection";
import api from "../../api/client";

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock user progress (in a real app, this would come from backend)
  const [userProgress, setUserProgress] = useState(() => {
    const savedProgress = localStorage.getItem(`course-${id}-progress`);
    return savedProgress
      ? JSON.parse(savedProgress)
      : {
          enrolled: false,
          completedLessons: [],
          completedQuizzes: [],
          finalExamPassed: false,
          feedbackGiven: false,
        };
  });

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(
          `/Courses/${id}`
        );
        setCourse(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    localStorage.setItem(`course-${id}-progress`, JSON.stringify(userProgress));
  }, [userProgress, id]);


  const totalLessons =
    course?.syllabus?.reduce(
      (total, section) => total + section.lessons.length,
      0
    ) || 0;

  const calculateProgress = () => {
    const completed = userProgress.completedLessons.length;
    return totalLessons ? Math.floor((completed / totalLessons) * 100) : 0;
  };

  if (loading) return <div className="loading">Loading course details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!course) return <div className="course-not-found">Course not found</div>;

  // Calculate original price for discount display
  const originalPrice = course.price > 0 ? course.price * 1.5 : 0;
  const discountPercentage = course.price > 0 ? 33 : 0;

  // Add mock data for items not in the API response
  const fullCourse = {
    ...course,
    articlesCount: course.articlesCount || 15,
    downloadableResources: course.downloadableResources || 10,
    totalHours: course.duration || "5h 30m",
    ratingsDistribution: course.ratingsDistribution || {
      5: 0.75,
      4: 0.15,
      3: 0.05,
      2: 0.03,
      1: 0.02,
    },
    originalPrice,
    discount: discountPercentage,
  };

  return (
    <div id="up">
      <Header />
      <div className="course-details-page">
        {/* Hero Section */}
        <div className="course-hero">
          <div className="course-hero-content">
            <div className="breadcrumb">
              {fullCourse.category?.join(" / ") || "Development"}
            </div>
            <h1>{fullCourse.courseTitle}</h1>
            <p className="hero-subtitle">{fullCourse.courseSubtitle}</p>

            <div className="course-meta">
              <span className="meta-item">
                <FaStar className="meta-icon" />
                <span className="rating">{fullCourse.rating}</span>
                <span className="reviews-count">
                  ({fullCourse.students?.toLocaleString() || "1000"} students)
                </span>
              </span>
              <span className="meta-item">
                <FaUserGraduate className="meta-icon" /> {fullCourse.level}
              </span>
              <span className="meta-item">
                <FaClock className="meta-icon" /> {fullCourse.totalHours}
              </span>
              <span className="meta-item">
                <FaChalkboardTeacher className="meta-icon" />{" "}
                {fullCourse.instructor}
              </span>
            </div>
          </div>

          <div className="course-hero-image">
            <img
              src={fullCourse.imgPath || "/images/default-course.jpg"}
              alt={fullCourse.courseTitle}
            />
            <div className="image-overlay">
              <button className="preview-button">
                <FaPlay /> Preview Course
              </button>
            </div>
          </div>
        </div>

        <div className="course-container">
          <div className="course-main-content">
            {/* Tabs */}
            <div className="course-tabs">
              <button
                className={`tab-button ${
                  activeTab === "overview" ? "active" : ""
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`tab-button ${
                  activeTab === "Lessons" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Lessons")}
              >
                Lessons
              </button>
              <button
                className={`tab-button ${
                  activeTab === "instructor" ? "active" : ""
                }`}
                onClick={() => setActiveTab("instructor")}
              >
                Instructor
              </button>
              <button
                className={`tab-button ${
                  activeTab === "reviews" ? "active" : ""
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews
              </button>
            </div>

            {/* Tab Content Sections */}
            {activeTab === "overview" && (
              <section className="course-section overview-section">
                <h2 className="section-title">About This Course</h2>
                <p className="course-description">
                  {fullCourse.Description || fullCourse.courseSubtitle}
                </p>

                <h3 className="section-subtitle">What You&apos;ll Learn</h3>
                <div className="learning-outcomes">
                  {fullCourse.learningOutcomes?.map((outcome, i) => (
                    <div key={i} className="outcome-item">
                      <FaCheck className="outcome-icon" />
                      <p>{outcome}</p>
                    </div>
                  ))}
                </div>

                <h3 className="section-subtitle">Requirements</h3>
                <ul className="requirements-list">
                  <li>Basic programming knowledge</li>
                  <li>A computer with internet access</li>
                  <li>Willingness to learn and practice</li>
                </ul>
              </section>
            )}

            {activeTab === "Lessons" && (
              <LessonsSection
                course={fullCourse}
                userProgress={userProgress}
                setUserProgress={setUserProgress}
              />
            )}

            {activeTab === "instructor" && (
              <section className="course-section instructor-section">
                <h2 className="section-title">About the Instructor</h2>
                <div className="instructor-profile">
                  <img
                    src={
                      fullCourse.instructorImage ||
                      "/images/default-instructor.jpg"
                    }
                    alt={fullCourse.instructor}
                    className="instructor-avatar"
                  />
                  <div className="instructor-details">
                    <h3 className="instructor-name">{fullCourse.instructor}</h3>
                    <p className="instructor-title">
                      {fullCourse.instructorTitle}
                    </p>

                    <div className="instructor-stats">
                      <div className="stat-item">
                        <FaStar className="stat-icon" />
                        <span>
                          {fullCourse.instructorRating} Instructor Rating
                        </span>
                      </div>
                      <div className="stat-item">
                        <FaUserGraduate className="stat-icon" />
                        <span>
                          {fullCourse.instructorStudents?.toLocaleString() ||
                            "8,000"}{" "}
                          Students
                        </span>
                      </div>
                      <div className="stat-item">
                        <MdOutlineSell className="stat-icon" />
                        <span>{fullCourse.instructorCourses || 3} Courses</span>
                      </div>
                    </div>

                    <p className="instructor-bio">
                      {fullCourse.instructorBio ||
                        "An experienced instructor with years of practical knowledge in the field."}
                    </p>
                  </div>
                </div>
              </section>
            )}
            {activeTab === "reviews" && (
              <ReviewsSection
                course={fullCourse}
                userProgress={userProgress}
                newReview={newReview}
                setNewReview={setNewReview}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="course-sidebar">
            <div className="sidebar-card">
              <div className="pricing-card">
                <div className="includes-list">
                  <h4 className="includes-title">This course includes:</h4>
                  <ul className="includes-items">
                    <li>
                      <FaPlay className="include-icon" />
                      <span>{fullCourse.totalHours} hours on-demand video</span>
                    </li>
                    <li>
                      <FaFileAlt className="include-icon" />
                      <span>{fullCourse.articlesCount} articles</span>
                    </li>
                    <li>
                      <FaDownload className="include-icon" />
                      <span>
                        {fullCourse.downloadableResources} downloadable
                        resources
                      </span>
                    </li>
                    <li>
                      <FaMobileAlt className="include-icon" />
                      <span>Access on mobile and TV</span>
                    </li>
                    <li>
                      <FaCertificate className="include-icon" />
                      <span>Certificate of completion</span>
                    </li>
                  </ul>
                </div>

                {/* Progress Section in Sidebar */}
                {userProgress.enrolled && (
                  <div className="progress-section">
                    <h4>Your Progress</h4>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${calculateProgress()}%` }}
                      ></div>
                    </div>
                    <p>{calculateProgress()}% Complete</p>

                    {userProgress.finalExamPassed && (
                      <button
                        className="progress-action-button"
                        onClick={() => navigate(`/course/${id}/certificate`)}
                      >
                        Get Certificate
                      </button>
                    )}
                  </div>
                )}

                <div className="achievements-cta">
                  <button
                    className="view-achievements-btn"
                    onClick={() => navigate(`/course/${id}/achievements`)}
                  >
                    <FaMedal className="btn-icon" />
                    View achievements
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
