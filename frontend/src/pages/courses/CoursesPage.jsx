import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../api/client";
import { FaBookOpen } from "react-icons/fa";
import { MdOutlinePayment } from "react-icons/md";
import "../../styles/CoursesPage.css";

const CoursesPage = () => {
  const navigate = useNavigate();
  const [currentActive, setCurrentActive] = useState("all");
  const [courses, setCourses] = useState([]);
  const [arr, setArr] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    level: "",
    price: "",
    rating: "",
  });
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/Courses");
        const formattedCourses = response.data.map((course) => ({
          ...course,
          CourseTitle: course.courseTitle,
          courseSubtitle: course.courseSubtitle,
          imgPath: course.imgPath || "https://via.placeholder.com/300x180",
          rating: course.rating || 0,
          category: course.category.map((c) => c.toLowerCase()),
        }));
        setCourses(formattedCourses);
        setArr(formattedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleClick = (buttonCategory) => {
    setCurrentActive(buttonCategory);
    const newArr = courses.filter((item) => {
      return (
        buttonCategory === "all" ||
        item.category.some((cat) => cat === buttonCategory.toLowerCase())
      );
    });
    setArr(newArr);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredCourses = arr.filter((course) => {
    const matchesSearch = course.CourseTitle.toLowerCase().includes(
      searchQuery.toLowerCase()
    );
    const matchesLevel =
      !filters.level ||
      course.level.toLowerCase() === filters.level.toLowerCase();
    const matchesRating =
      !filters.rating || course.rating >= Number(filters.rating);
    let matchesPrice = true;
    if (filters.price === "free") matchesPrice = course.price === 0;
    else if (filters.price === "paid") matchesPrice = course.price > 0;
    return matchesSearch && matchesLevel && matchesRating && matchesPrice;
  });

  const viewCourseDetails = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleEnroll = async (course) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (course.price > 0) {
        localStorage.setItem(
          "selectedCourse",
          JSON.stringify({
            id: course.id,
            name: course.CourseTitle,
            price: course.price,
            duration: course.duration,
            instructor: course.instructor,
          })
        );
        navigate(`/payment/${course.id}`);

        return;
      }

      setEnrollmentStatus((prev) => ({
        ...prev,
        [course.id]: "enrolled",
      }));

      navigate(`/course/${course.id}/content`);
    } catch (error) {
      console.error("Enrollment failed:", error);
      if (error.response?.status === 401) {
        alert("Please login first");
        navigate("/login");
      } else {
        alert("Enrollment failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="up">
      <Header />
      <div className="courses-page">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-section">
          <select
            name="level"
            value={filters.level}
            onChange={handleFilterChange}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            name="price"
            value={filters.price}
            onChange={handleFilterChange}
          >
            <option value="">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          <select
            name="rating"
            value={filters.rating}
            onChange={handleFilterChange}
          >
            <option value="">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
        </div>

        <section className="buttons-section">
          <button
            onClick={() => handleClick("all")}
            className={currentActive === "all" ? "active" : ""}
          >
            All
          </button>
          {[
            "Web Development",
            "Mobile Development",
            "Data Science",
            "AI & ML",
            "Security",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => handleClick(cat)}
              className={currentActive === cat ? "active" : ""}
            >
              {cat}
            </button>
          ))}
        </section>

        <section className="courses-grid">
          <AnimatePresence>
            {filteredCourses.map((course) => (
              <motion.article
                layout
                initial={{ transform: "scale(0.4)" }}
                animate={{ transform: "scale(1)" }}
                transition={{ type: "spring", damping: 8, stiffness: 50 }}
                key={course.id}
                className="course-card"
              >
                <img src={course.imgPath} alt={course.CourseTitle} />
                <div className="course-details">
                  <div className="course-header">
                    <h3 className="course-title">{course.CourseTitle}</h3>
                    <span className={`level-tag ${course.level.toLowerCase()}`}>
                      {course.level}
                    </span>
                  </div>
                  <p className="course-subtitle">{course.courseSubtitle}</p>

                  <div className="course-meta">
                    <span>{course.duration}</span>
                    <span>
                      ⭐ {course.rating} ({course.students})
                    </span>
                    <span>
                      {course.price > 0 ? `$${course.price}` : "Free"}
                    </span>
                  </div>

                  <div className="course-actions">
                    <button
                      className="details-btn"
                      onClick={() => viewCourseDetails(course.id)}
                    >
                      View Details
                    </button>
                    <button
                      className={`enroll-btn ${
                        course.price > 0 ? "paid" : "free"
                      }`}
                      onClick={() => handleEnroll(course)}
                      disabled={
                        loading || enrollmentStatus[course.id] === "enrolled"
                      }
                    >
                      {loading ? (
                        "Processing..."
                      ) : enrollmentStatus[course.id] === "enrolled" ? (
                        "Enrolled!"
                      ) : course.price > 0 ? (
                        <>
                          <MdOutlinePayment /> Enroll Now
                        </>
                      ) : (
                        <>
                          <FaBookOpen /> Start Learning
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default CoursesPage;
