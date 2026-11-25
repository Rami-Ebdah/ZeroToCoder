import { useParams, Link, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../../api/client";
import { useEffect, useState } from "react";
import "../../styles/Roadmaps.css";

export default function RoadmapDetails() {
  const { roadmapName } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roadmapName) {
      navigate("/roadmaps");
      return;
    }

    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const normalizedRoadmapName = roadmapName
          .toLowerCase()
          .replace(/-/g, " ");
        const { data: roadmaps } = await api.get("/Roadmaps");

        // Find roadmap with case-insensitive matching
        const matchedRoadmap = roadmaps.find(
          (rm) => rm.specialization?.trim().toLowerCase() === normalizedRoadmapName
        );

        if (!matchedRoadmap) {
          throw new Error("Roadmap not found");
        }

        setRoadmap(matchedRoadmap);
        setLoading(false);
      } catch (err) {
        setError(getErrorMessage(err, err.message || "Failed to fetch roadmap data"));
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [roadmapName, navigate]);

  if (loading) {
    return (
      <div className="details-container">
        <p>Loading...</p>
        <Link to="/roadmaps" className="back-button">
          ← Back to Roadmaps
        </Link>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="details-container">
        <p>Error: {error || "Roadmap not found."}</p>
        <Link to="/roadmaps" className="back-button">
          ← Back to Roadmaps
        </Link>
      </div>
    );
  }

  // Handle image path
  const imageSrc = roadmap.imagePath.includes("frontend.jpg")
    ? "/images/frontend.jpg"
    : roadmap.imagePath;

  return (
    <div className="details-container">
      <header className="details-header">
        <h1>{roadmap.specialization} Roadmap</h1>
        <Link to="/roadmaps" className="back-button">
          ← Back to Roadmaps
        </Link>
      </header>

      <section className="image-section">
        <img
          src={imageSrc}
          alt={`${roadmap.specialization} roadmap`}
          className="roadmap-image"
          onError={(e) => {
            e.target.src = "/images/backend.jpg";
          }}
        />
      </section>

      <section className="source-section">
        <p>
          Source:{" "}
          <a
            href="https://roadmap.sh"
            target="_blank"
            rel="noopener noreferrer"
          >
            roadmap.sh
          </a>
        </p>
      </section>
    </div>
  );
}
