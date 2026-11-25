import { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { FaAward, FaDownload, FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { useAuth } from "../../context/useAuth";
import api, { getErrorMessage } from "../../api/client";

// Styles
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
  font-family: "Tajawal", sans-serif;
`;

const Header = styled.header`
  padding: 1rem 2rem;
  background-color: #7c3aed;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
`;

const Footer = styled.footer`
  padding: 1rem 2rem;
  background-color: #1f2937;
  color: white;
  text-align: center;
`;

const Main = styled.main`
  flex-grow: 1;
  padding: 3rem 1.5rem;
  display: flex;
  justify-content: center;
`;

const Wrapper = styled.div`
  max-width: 800px;
  width: 100%;
`;

const TopActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
`;

const StyledButton = styled.button`
  background-color: ${({ primary }) => (primary ? "#7c3aed" : "transparent")};
  color: ${({ primary }) => (primary ? "white" : "#4b5563")};
  border: ${({ primary }) => (primary ? "none" : "1px solid #d1d5db")};
  padding: 0.5rem 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background-color: ${({ primary }) => (primary ? "#6d28d9" : "#f3f4f6")};
    transform: translateY(-2px);
  }
`;

const CertificateBox = styled.div`
  background-color: white;
  padding: 3rem;
  border: 8px solid #e9d5ff;
  border-radius: 1rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  direction: rtl; /* Keep RTL if Arabic names/titles are needed */
`;

const Center = styled.div`
  text-align: center;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  svg {
    font-size: 5rem;
    color: #7c3aed;
  }
`;

const NameBox = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: #7c3aed;
  display: inline-block;
  border-bottom: 2px solid #e9d5ff;
  padding-bottom: 0.5rem;
  margin: 1rem 0 2rem 0;
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
`;

const GridItem = styled.div`
  text-align: center;
  border-top: 2px solid #e5e7eb;
  padding-top: 1rem;
`;

const SmallText = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
`;

const Certificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const { currentUser: userData } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data } = await api.get(`/Courses/${id}`);
        setCourse(data);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to fetch course data"));
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(currentDate);

  // Deterministic so the id doesn't change on every re-render (it was random before).
  const certificateId = `CERT-${id}-${String(userData?.id ?? 0).padStart(6, "0")}`;

  const handleDownload = () => {
    const element = certificateRef.current;
    const options = {
      margin: 0.5,
      filename: `${userData?.fullName?.replace(" ", "_") || "certificate"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
    };
    html2pdf().from(element).set(options).save();
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Loading certificate...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
        <p>Error: {error}</p>
        <StyledButton onClick={() => window.location.reload()}>
          Retry
        </StyledButton>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>You must be logged in to view the certificate</p>
        <StyledButton primary onClick={() => navigate("/login")}>
          Go to Login Page
        </StyledButton>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>No course data available</p>
        <StyledButton onClick={() => navigate(-1)}>Go Back</StyledButton>
      </div>
    );
  }

  return (
    <PageContainer>
      <Header>E-Learning Platform</Header>
      <Main>
        <Wrapper>
          <TopActions>
            <StyledButton onClick={() => navigate(-1)}>
              <FaArrowLeft /> Back
            </StyledButton>
            <StyledButton primary onClick={handleDownload}>
              <FaDownload /> Download Certificate
            </StyledButton>
          </TopActions>

          <CertificateBox ref={certificateRef}>
            <Center>
              <IconWrapper>
                <FaAward />
              </IconWrapper>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
                Certificate of Completion
              </h1>
              <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                This certificate is awarded to
              </p>
              <NameBox>{userData.fullName}</NameBox>
              <p style={{ color: "#4b5563", fontSize: "1.125rem" }}>
                for successfully completing the training course
              </p>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  margin: "1rem 0",
                }}
              >
                {course.courseTitle}
              </h3>
              <p style={{ color: "#6b7280" }}>
                Total training hours: {course.duration}
              </p>
            </Center>

            <BottomGrid>
              <GridItem>
                <p>{formattedDate}</p>
                <SmallText>Date of Issue</SmallText>
              </GridItem>
              <GridItem>
                <p>{course.instructor}</p>
                <SmallText>Instructor Name</SmallText>
              </GridItem>
            </BottomGrid>

            <Center style={{ marginTop: "2rem" }}>
              <SmallText>Certificate ID: {certificateId}</SmallText>
              <SmallText>
                You can verify this certificate at: example.com/verify
              </SmallText>
            </Center>
          </CertificateBox>

          <Center style={{ marginTop: "2rem" }}>
            <StyledButton primary onClick={handleDownload}>
              <FaDownload /> Download Certificate (PDF)
            </StyledButton>
          </Center>
        </Wrapper>
      </Main>
      <Footer>© {new Date().getFullYear()} All Rights Reserved</Footer>
    </PageContainer>
  );
};

export default Certificate;
