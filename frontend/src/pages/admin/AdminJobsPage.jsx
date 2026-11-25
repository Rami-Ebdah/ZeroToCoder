import { useEffect, useState } from "react";
import api from "../../api/client";
import "../../styles/AdminJobsPage.css";
import Header from "../../components/layout/Header";

const API_URL = "/JobPosts";

const emptyJob = {
  jobID: 0,
  title: "",
  company: "",
  location: "",
  type: "",
  employmentType: "",
  description: "",
  aboutJob: "",
  aboutCompany: "",
  skills: "",
};

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
];
const jobTypes = ["On-site", "Remote", "Hybrid"];

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ ...emptyJob });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_URL);
      const sortedJobs = [...response.data].sort((a, b) => b.jobID - a.jobID);
      setJobs(sortedJobs);
      setFilteredJobs(sortedJobs); // Initialize filtered jobs with all jobs
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const apiData = {
      ...formData,
      skills: Array.isArray(formData.skills)
        ? formData.skills.join("|")
        : formData.skills || "",
    };

    try {
      if (formData.jobID && formData.jobID !== 0) {
        await api.put(`${API_URL}/${formData.jobID}`, apiData);
      } else {
        await api.post(API_URL, apiData);
      }
      fetchJobs();
      setFormData({ ...emptyJob });
      setActiveTab("basic");
    } catch (err) {
      console.error("Error saving job:", err);
      setError("Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setFormData({
      ...job,
      skills: job.skills?.split("|").join(", "),
    });
    setActiveTab("basic");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    setLoading(true);
    setError(null);
    try {
      await api.delete(`${API_URL}/${jobId}`);
      fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
      if (err.response?.status === 500) {
        setError("Cannot delete job because it has associated applications.");
      } else {
        setError("Failed to delete job");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="up">
      <Header />
      <div className="admin-container">
        <h2>Job Management</h2>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="dismiss-btn">
              ×
            </button>
          </div>
        )}

        <form className="admin-job-form" onSubmit={handleSubmit}>
          <div
            className={`tab-content ${activeTab === "basic" ? "active" : ""}`}
          >
            <div className="form-row">
              <div className="form-group">
                <label>Job Title*</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Senior React Developer"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company Name*</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Company name"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location*</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. New York, Remote"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Job Type*</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select job type</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Employment Type*</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select employment type</option>
                  {employmentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Required Skills*</label>
                <input
                  type="text"
                  name="skills"
                  placeholder="e.g. React, Node.js, TypeScript (comma separated)"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div
            className={`tab-content ${activeTab === "details" ? "active" : ""}`}
          >
            <div className="form-group">
              <label>Short Description*</label>
              <textarea
                name="description"
                placeholder="Brief summary of the job (shown in listings)"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
              ></textarea>
            </div>

            <div className="form-group">
              <label>About the Job*</label>
              <textarea
                name="aboutJob"
                placeholder="Detailed description of responsibilities and requirements"
                value={formData.aboutJob}
                onChange={handleChange}
                required
                rows={4}
              ></textarea>
            </div>
          </div>

          <div
            className={`tab-content ${activeTab === "company" ? "active" : ""}`}
          >
            <div className="form-group">
              <label>About the Company*</label>
              <textarea
                name="aboutCompany"
                placeholder="Information about your company"
                value={formData.aboutCompany}
                onChange={handleChange}
                required
                rows={4}
              ></textarea>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="save-button" disabled={loading}>
              {formData.jobID ? "Update Job" : "Add Job"}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setFormData({ ...emptyJob });
                setActiveTab("basic");
              }}
            >
              Clear Form
            </button>
          </div>
        </form>

        {loading && <div className="loading-indicator">Loading...</div>}

        <div className="job-list-header">
          <h3>Current Job Listings ({filteredJobs.length})</h3>
          <div className="search-filter">
            <input
              type="text"
              placeholder="Filter by job title..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </div>

        <div className="job-list">
          {filteredJobs.map((job) => {
            const id = job.jobID || job.jobId || job.id;
            if (!id) return null;
            return (
              <div key={id} className="job-card">
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <span className="job-type">
                    {job.type} • {job.employmentType}
                  </span>
                </div>
                <p className="company-location">
                  {job.company} • {job.location}
                </p>
                <p className="job-description">{job.description}</p>
                <div className="job-skills">
                  <strong>Skills:</strong> {job.skills?.split("|").join(", ")}
                </div>
                <div className="button-group">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(job)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminJobsPage;
