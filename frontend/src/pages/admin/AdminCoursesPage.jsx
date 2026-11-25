import { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import api, { getErrorMessage } from "../../api/client";
import "../../styles/AdminCourses.css";

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    courseTitle: "",
    courseSubtitle: "",
    description: "",
    price: 0,
    duration: "",
    level: "Beginner",
    imgPath: "",
    category: [],
    instructor: "",
    rating: 0,
    students: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.some((cat) =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );
  const categoriesOptions = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "AI & ML",
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/Courses");
      setCourses(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch courses");
      setLoading(false);
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return { ...prev, category: [...prev.category, value] };
      } else {
        return {
          ...prev,
          category: prev.category.filter((cat) => cat !== value),
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Empty inputs become null so numeric API fields bind correctly.
    const toNumber = (value) => (value === "" || value == null ? null : Number(value));
    const payload = {
      ...formData,
      price: toNumber(formData.price),
      rating: toNumber(formData.rating),
      students: toNumber(formData.students),
    };
    try {
      if (isEditing && currentCourse) {
        await api.put(`/Courses/${currentCourse.id}`, payload);
      } else {
        await api.post("/Courses", payload);
      }
      resetForm();
      fetchCourses();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save course"));
    }
  };

  const handleEdit = (course) => {
    setIsEditing(true);
    setCurrentCourse(course);
    setFormData({
      courseTitle: course.courseTitle,
      courseSubtitle: course.courseSubtitle,
      description: course.description,
      price: course.price,
      duration: course.duration,
      level: course.level,
      imgPath: course.imgPath,
      category: course.category,
      instructor: course.instructor,
      rating: course.rating || 0,
      students: course.students || 0,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await api.delete(`/Courses/${id}`);
        fetchCourses();
      } catch (err) {
        setError(getErrorMessage(err, "Failed to delete course"));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      courseTitle: "",
      courseSubtitle: "",
      description: "",
      price: 0,
      duration: "",
      level: "Beginner",
      imgPath: "",
      category: [],
      instructor: "",
      rating: 0,
      students: 0,
    });
    setIsEditing(false);
    setCurrentCourse(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div id="up">
      <Header />
      <div className="admin-courses-container">
        <h1>{isEditing ? "Edit Course" : "Add New Course"}</h1>

        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <label>Course Title</label>
            <input
              type="text"
              name="courseTitle"
              value={formData.courseTitle}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              name="courseSubtitle"
              value={formData.courseSubtitle}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                required
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Instructor</label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              name="imgPath"
              value={formData.imgPath}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Categories</label>
            <div className="category-checkboxes">
              {categoriesOptions.map((category) => (
                <label key={category}>
                  <input
                    type="checkbox"
                    value={category}
                    checked={formData.category.includes(category)}
                    onChange={handleCategoryChange}
                  />
                  {category}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rating</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Students</label>
              <input
                type="number"
                name="students"
                value={formData.students}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">
              {isEditing ? "Update Course" : "Add Course"}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2>Manage Courses</h2>
        <div className="search-filter">
          <input
            type="text"
            placeholder="🔍Search courses by title, instructor or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="courses-list">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Level</th>
                <th>Price</th>
                <th>Categories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.courseTitle}</td>
                  <td>{course.level}</td>
                  <td>${course.price}</td>
                  <td>{course.category.join(", ")}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(course)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCoursesPage;
