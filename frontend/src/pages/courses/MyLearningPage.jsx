import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBook,
  FaChartBar,
  FaCertificate,
  FaSearch,
  FaArrowRight,
} from "react-icons/fa";
import styled, { ThemeProvider } from "styled-components";
import Header from "../../components/layout/Header";
import { lightTheme } from "../../theme";
import api from "../../api/client";

const PageContainer = styled.div`
  min-height: 100vh;
  color: ${({ theme }) => theme.textColor};
  transition: all 0.3s ease;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 4rem;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.primaryText};
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.secondaryText};
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.cardHoverShadow};
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ color, theme }) =>
    theme.mode === "dark" ? `${color}30` : `${color}20`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: ${({ color }) => color};
  font-size: 1.2rem;
`;

const StatContent = styled.div`
  h3 {
    font-size: 1.8rem;
    margin: 0;
    color: ${({ theme }) => theme.primaryText};
  }
  p {
    margin: 0.2rem 0 0;
    color: ${({ theme }) => theme.secondaryText};
    font-size: 0.9rem;
  }
`;

const SearchFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex-grow: 1;
  max-width: 500px;

  input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.inputBorder};
    font-size: 1rem;
    background: ${({ theme }) => theme.inputBackground};
    color: ${({ theme }) => theme.inputText};
    transition: all 0.3s;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => `${theme.primary}20`};
    }

    &::placeholder {
      color: ${({ theme }) => theme.placeholderText};
    }
  }

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.secondaryText};
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  background: ${({ active, theme }) =>
    active ? theme.primary : theme.filterButtonBackground};
  color: ${({ active, theme }) =>
    active ? theme.filterButtonActiveText : theme.filterButtonText};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ active, theme }) =>
      active ? theme.primaryHover : theme.filterButtonHoverBackground};
  }
`;

const CoursesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CourseCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.cardShadow};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.cardHoverShadow};
  }
`;

const CourseImage = styled.div`
  height: 180px;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const ProgressBadge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${({ theme }) =>
    theme.mode === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.7)"};
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const CourseContent = styled.div`
  padding: 1.5rem;
`;

const CourseTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.primaryText};
  margin: 0 0 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Instructor = styled.p`
  color: ${({ theme }) => theme.secondaryText};
  font-size: 0.9rem;
  margin: 0 0 1rem;
`;

const ProgressContainer = styled.div`
  margin: 1.5rem 0;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.progressBarBackground};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.primary};
  border-radius: 4px;
  width: ${({ progress }) => progress}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.secondaryText};
  margin-top: 0.5rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${({ status, theme }) => {
    if (theme.mode === "dark") {
      switch (status) {
        case "Completed":
          return "#1e5631";
        case "Final Exam Passed":
          return "#5d4a00";
        case "In Progress":
          return "#0d4a5a";
        case "Started":
          return `${theme.primary}30`;
        default:
          return theme.cardBackground;
      }
    } else {
      switch (status) {
        case "Completed":
          return "#d4edda";
        case "Final Exam Passed":
          return "#fff3cd";
        case "In Progress":
          return "#d1f0ff";
        case "Started":
          return "#e1f0ff";
        default:
          return "#f0f0f0";
      }
    }
  }};
  color: ${({ status, theme }) => {
    if (theme.mode === "dark") {
      switch (status) {
        case "Completed":
          return "#a3e4a8";
        case "Final Exam Passed":
          return "#ffe082";
        case "In Progress":
          return "#7fd1e0";
        case "Started":
          return theme.primary;
        default:
          return theme.secondaryText;
      }
    } else {
      switch (status) {
        case "Completed":
          return "#155724";
        case "Final Exam Passed":
          return "#856404";
        case "In Progress":
          return "#17a2b8";
        case "Started":
          return "#4a6bff";
        default:
          return "#666";
      }
    }
  }};
`;

const ContinueButton = styled.button`
  width: 60%;
  padding: 0.8rem;
  background: rgb(69, 103, 214);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }

  ${({ completed, theme }) =>
    completed &&
    `
    background: ${theme.success};
    &:hover {
      background: ${theme.successHover};
    }
  `}
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  background: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.cardShadow};

  p {
    color: ${({ theme }) => theme.secondaryText};
    margin-bottom: 1.5rem;
  }

  button {
    padding: 0.8rem 1.5rem;
    background: ${({ theme }) => theme.primary};
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: ${({ theme }) => theme.primaryHover};
    }
  }
`;

// Main Component
const MyLearningPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const theme = lightTheme;
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/MyLearning");
        setCourses(response.data);
      } catch (error) {
        console.error("Failed to fetch learning courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const calculateCourseProgress = (courseId) => {
    try {
      const progressData = localStorage.getItem(`course-${courseId}-progress`);
      if (!progressData) return 0;

      const progress = JSON.parse(progressData);

      const totalLessons = progress.totalLessons || 10;
      const totalQuizzes = progress.totalQuizzes || 2;

      const totalItems = totalLessons + totalQuizzes + 1;
      const completedItems =
        (progress.completedLessons?.length || 0) +
        (progress.completedQuizzes?.length || 0) +
        (progress.finalExamPassed ? 1 : 0);

      return Math.round((completedItems / totalItems) * 100);
    } catch (error) {
      console.error("Error calculating progress:", error);
      return 0;
    }
  };
  const getCourseStatus = (id) => {
    try {
      const progress = JSON.parse(
        localStorage.getItem(`course-${id}-progress`)
      );
      if (!progress) return "Not Started";
      if (progress.feedbackGiven) return "Completed";
      if (progress.finalExamPassed) return "Final Exam Passed";
      if (progress.completedQuizzes.length > 0) return "In Progress";
      if (progress.completedLessons.length > 0) return "Started";
      return "Enrolled";
    } catch (error) {
      console.error("Error getting course status:", error);
      return "Error";
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course?.courseTitle
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" ||
      getCourseStatus(Number(course.id)) === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <Header />
        <ContentContainer>
          <PageHeader>
            <PageTitle>My Learning</PageTitle>
            <PageSubtitle>
              Track your progress and continue your journey
            </PageSubtitle>
          </PageHeader>

          <StatsContainer>
            <StatCard>
              <StatIcon color="#4a6bff">
                <FaBook />
              </StatIcon>
              <StatContent>
                <h3>{courses.length}</h3>
                <p>Courses Enrolled</p>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIcon color="#6f42c1">
                <FaChartBar />
              </StatIcon>
              <StatContent>
                <h3>
                  {courses.length > 0
                    ? Math.round(
                        courses.reduce(
                          (sum, course) =>
                            sum + calculateCourseProgress(Number(course.id)),
                          0
                        ) / courses.length
                      )
                    : 0}
                  %
                </h3>
                <p>Average Progress</p>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIcon color="#28a745">
                <FaCertificate />
              </StatIcon>
              <StatContent>
                <h3>
                  {
                    courses.filter(
                      (course) =>
                        JSON.parse(
                          localStorage.getItem(`course-${course.id}-progress`)
                        )?.feedbackGiven
                    ).length
                  }
                </h3>
                <p>Certificates Earned</p>
              </StatContent>
            </StatCard>
          </StatsContainer>

          <SearchFilterContainer>
            <SearchBox>
              <FaSearch />
              <input
                type="text"
                placeholder="Search your courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>

            <FilterButtons>
              <FilterButton
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
              >
                All Courses
              </FilterButton>
              <FilterButton
                active={activeFilter === "In Progress"}
                onClick={() => setActiveFilter("In Progress")}
              >
                In Progress
              </FilterButton>
              <FilterButton
                active={activeFilter === "Completed"}
                onClick={() => setActiveFilter("Completed")}
              >
                Completed
              </FilterButton>
            </FilterButtons>
          </SearchFilterContainer>

          <CoursesGrid>
            {filteredCourses.length === 0 ? (
              <EmptyState>
                <p>
                  {courses.length === 0
                    ? "You haven't enrolled in any courses yet."
                    : "No courses match your search."}
                </p>
                <button onClick={() => navigate("/courses")}>
                  Browse Courses
                </button>
              </EmptyState>
            ) : (
              filteredCourses.map((course) => {
                const progress = calculateCourseProgress(Number(course.id));
                const status = getCourseStatus(Number(course.id));

                return (
                  <CourseCard key={Number(course.id)}>
                    <CourseImage>
                      <img src={course.imgPath} alt={course.courseTitle} />
                      <ProgressBadge>{progress}%</ProgressBadge>
                      {status === "Completed" && (
                        <ProgressBadge
                          style={{
                            top: "3.5rem",
                            backgroundColor: theme.success,
                          }}
                        >
                          <FaCertificate />
                        </ProgressBadge>
                      )}
                    </CourseImage>

                    <CourseContent>
                      <CourseTitle>{course.courseTitle}</CourseTitle>
                      <Instructor>By {course.instructor}</Instructor>

                      <ProgressContainer>
                        <ProgressBar>
                          <ProgressFill progress={progress} />
                        </ProgressBar>
                        <ProgressText>
                          <span>Progress: {progress}%</span>
                          <StatusBadge status={status}>{status}</StatusBadge>
                        </ProgressText>
                      </ProgressContainer>

                      <ContinueButton
                        onClick={() => navigate(`/course/${course.id}`)}
                        completed={status === "Completed"}
                      >
                        {status === "Completed"
                          ? "View Certificate"
                          : "Continue"}
                        <FaArrowRight />
                      </ContinueButton>
                    </CourseContent>
                  </CourseCard>
                );
              })
            )}
          </CoursesGrid>
        </ContentContainer>
      </PageContainer>
    </ThemeProvider>
  );
};

export default MyLearningPage;
