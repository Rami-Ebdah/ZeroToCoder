import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../api/client";
import Header from "../../components/layout/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";

// Styled Components
const Container = styled.div`
  padding: 0 50px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  color: var(--blue);
  margin-bottom: 30px;
`;

const Filters = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterInput = styled.input`
  padding: 12px 15px;
  border: 1px solid var(--border);
  background-color: var(--bgHeader);
  color: var(--title);
  border-radius: 5px;
  font-size: 0.9rem;
  flex: 1;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b0855;
    box-shadow: 0 0 0 2px rgba(59, 8, 85, 0.2);
  }
`;

const JobList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-top: 30px;
`;

const JobCard = styled.div`
  background-color: var(--secondary);
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    border-color: #3b0855;
  }
`;

const JobTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--blue);
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 15px;
`;

const CompanyName = styled.p`
  font-size: 1.1rem;
  color: var(--subtitle);
  margin-bottom: 8px;
  font-family: "Times New Roman", serif;
  font-weight: 500;
`;

const Location = styled.p`
  font-size: 0.9rem;
  color: var(--subtitle);
  margin-bottom: 7px;
  font-family: "Times New Roman", serif;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Description = styled.p`
  font-size: 0.95rem;
  color: var(--subtitle);
  font-family: "Times New Roman", serif;
  line-height: 1.6;
  flex-grow: 1;
`;

const Skills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 5px;
`;

const SkillTag = styled.span`
  background-color: rgba(59, 8, 85, 0.1);
  padding: 6px 12px;
  margin: 6px;
  border-radius: 20px;
  font-size: 0.8rem;
  color:  var(--blue);
  border: 1px solid rgba(59, 8, 85, 0.2);
`;

  

const ApplyButton = styled.button`
  width: 70%;
  background: #3b0855;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;

  &:hover {
    background: #852467;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  color: #333;
  padding: 0 40px;
  border-radius: 12px;
  width: 800px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  font-family: "Times New Roman", serif;
  line-height: 1.6;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 15px;
  background: transparent;
  color: #666;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 5px;
  transition: all 0.2s ease;

  &:hover {
    color: #3b0855;
    transform: scale(1.1);
  }
`;
const SubmitButton = styled.button`
  width: 40%;
  height: 40%;
  background: #3b0855;
  color: #fff;
  border: none;
  padding: 0px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
  margin-top: 40px;

  &:hover {
    background: #852467;
  }
`;

const JobDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  width: 70%;
  color: #3b0855;
  font-weight: 600;
  border-bottom: 2px solid rgba(59, 8, 85, 0.1);
`;

const JobType = styled.p`
  font-size: 1rem;
  color: #555;
  font-family: "Times New Roman", serif;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmploymentType = styled.p`
  font-size: 1rem;
  color: #555;
  font-family: "Times New Roman", serif;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CompanyLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  border-bottom: 1px solid #eee;
`;

const FileUploadContainer = styled.div``;

const FileInputLabel = styled.label`
  display: block;
  margin-top: 12px;
  font-weight: 500;
  font-size: 10px;
  color: #444;
`;

const FileInput = styled.input`
  display: block;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f9f9f9;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b0855;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(59, 8, 85, 0.1);
  }
`;

const ErrorMessage = styled.p`
  color: #d9534f;
  margin-top: 8px;
  font-size: 0.9rem;
`;

const SelectedFile = styled.p`
  margin-top: 10px;
  font-size: 0.9rem;
  color: #3b0855;
  display: flex;
  align-items: center;
  gap: 5px;

  &::before {
    content: "📄";
  }
`;
const AboutContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AboutSection = styled.div`
  border-radius: 8px;
`;

const JobOpportunities = () => {
  // States
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cv, setCv] = useState(null);
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get("/JobPosts");
        setJobs(data);
        setFilteredJobs(data);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Error fetching job listings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Apply filters whenever filters or jobs change
  useEffect(() => {
    const filtered = jobs.filter((job) => {
      // Location/skills are nullable in the database; guard against crashes.
      const locationMatch = (job.location ?? "")
        .toLowerCase()
        .includes(locationFilter.toLowerCase());

      const skillsArray =
        typeof job.skills === "string"
          ? job.skills.split("|").map((s) => s.trim().toLowerCase())
          : (job.skills ?? []).map((s) => s.toLowerCase());

      const skillMatch =
        skillFilter === "" ||
        skillsArray.some((skill) => skill.includes(skillFilter.toLowerCase()));

      return locationMatch && skillMatch;
    });

    setFilteredJobs(filtered);
  }, [locationFilter, skillFilter, jobs]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError("");
      setCv(null);
      return;
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Only PDF, DOC, and DOCX files are allowed.");
      setCv(null);
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      setCv(null);
      return;
    }

    setError("");
    setCv(file);
  };

  const handleSubmit = async () => {
    if (!selectedJob) {
      toast.error("No job selected");
      return;
    }

    if (!cv) {
      toast.error("Please upload your CV.");
      return;
    }

    // The applicant is identified by the access token on the server.
    const formData = new FormData();
    formData.append("CV", cv, cv.name);
    formData.append("JobID", selectedJob.jobID || selectedJob.id);

    try {
      await api.post("/JobApplications", formData);
      toast.success("Application submitted successfully!");
      setSelectedJob(null);
      setCv(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Submission failed. Please try again."));
    }
  };

  const handleCloseModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedJob(null);
    setCv(null);
    setError("");
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} />
      <Header />
      <Container>
        <Title>Job Opportunities</Title>

        <Filters>
          <FilterInput
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          <FilterInput
            type="text"
            placeholder="Filter by skill..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          />
        </Filters>

        {isLoading ? (
          <p>Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <p>No jobs found matching your criteria.</p>
        ) : (
          <JobList>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.jobID || job.id}
                onClick={() => setSelectedJob(job)}
              >
                <JobTitle>{job.title}</JobTitle>
                <CompanyName>{job.company}</CompanyName>
                <Location>{job.location}</Location>
                <JobType>Type: {job.type}</JobType>
                <EmploymentType>
                  Employment: {job.employmentType}
                </EmploymentType>
                <Description>
                  {job.description.length > 150
                    ? `${job.description.substring(0, 150)}...`
                    : job.description}
                </Description>
                <Skills>
                  {(typeof job.skills === "string"
                    ? job.skills.split("|").map((s) => s.trim())
                    : job.skills ?? []
                  ).map((skill, index) => (
                    <SkillTag key={index}>{skill}</SkillTag>
                  ))}
                </Skills>
                <ApplyButton>Apply Now</ApplyButton>
              </JobCard>
            ))}
          </JobList>
        )}
      </Container>

      {selectedJob && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={handleCloseModal}>×</CloseButton>
            <JobTitle>{selectedJob.title}</JobTitle>

            <CompanyLocation>
              <CompanyName>{selectedJob.company}</CompanyName>
              <Location>
                📍 
                {selectedJob.location}
              </Location>
            </CompanyLocation>

            <JobDetails>
              <div>
                <JobType>Job Type: {selectedJob.type}</JobType>
                <EmploymentType>
                  Employment: {selectedJob.employmentType}
                </EmploymentType>
              </div>

              <div>
                <SectionTitle>Job Description</SectionTitle>
                <Description>{selectedJob.description}</Description>
              </div>

              <AboutContainer>
                <AboutSection>
                  <SectionTitle>About The Company</SectionTitle>
                  <Description>{selectedJob.aboutCompany}</Description>
                </AboutSection>

                <AboutSection>
                  <SectionTitle>About This Job</SectionTitle>
                  <Description>{selectedJob.aboutJob}</Description>
                </AboutSection>
              </AboutContainer>

              <div>
                <SectionTitle>Required Skills</SectionTitle>
                <Skills>
                  {(typeof selectedJob.skills === "string"
                    ? selectedJob.skills.split("|").map((s) => s.trim())
                    : selectedJob.skills ?? []
                  ).map((skill, index) => (
                    <SkillTag key={index}>{skill}</SkillTag>
                  ))}
                </Skills>
              </div>
            </JobDetails>
            <AboutContainer>
              <FileUploadContainer>
                <FileInputLabel htmlFor="cv-upload">
                  Upload your CV (PDF, DOC, DOCX, max 5MB):
                </FileInputLabel>
                <FileInput
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
                {cv && <SelectedFile>Selected file: {cv.name}</SelectedFile>}
              </FileUploadContainer>

              <SubmitButton onClick={handleSubmit} disabled={!cv}>
                Submit Application
              </SubmitButton>
            </AboutContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
};

export default JobOpportunities;
