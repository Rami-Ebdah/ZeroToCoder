import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../api/client";
import "../../styles/AdminRoadmaps.css";
import Header from "../../components/layout/Header";

export default function AdminRoadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [newRoadmap, setNewRoadmap] = useState({
    specialization: "",
    imagePath: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/Roadmaps");
      setRoadmaps(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch roadmaps"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoadmap = async (e) => {
    e.preventDefault();
    try {
      await api.post("/Roadmaps", newRoadmap);
      setNewRoadmap({ specialization: "", imagePath: "" });
      fetchRoadmaps();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add roadmap"));
    }
  };

  const handleUpdateRoadmap = async (id) => {
    try {
      const { specialization, imagePath } = roadmaps.find((rm) => rm.roadmapID === id);
      await api.put(`/Roadmaps/${id}`, { specialization, imagePath });
      setEditingId(null);
      fetchRoadmaps();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update roadmap"));
    }
  };

  const handleDeleteRoadmap = async (id) => {
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;
    try {
      await api.delete(`/Roadmaps/${id}`);
      fetchRoadmaps();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete roadmap"));
    }
  };

  const handleEditChange = (id, field, value) => {
    setRoadmaps((prev) =>
      prev.map((rm) => (rm.roadmapID === id ? { ...rm, [field]: value } : rm))
    );
  };

  if (loading) return <div className="details-container">Loading...</div>;
  if (error) return <div className="details-container">Error: {error}</div>;

  return (
    <div className="up">
      <Header />
      <div className="details-container">
        <h2>Manage Roadmaps</h2>

        <section className="add-roadmap-section">
          <div className="add-roadmap-container">
            <input
              type="text"
              placeholder="Enter specialization"
              value={newRoadmap.specialization}
              onChange={(e) =>
                setNewRoadmap({ ...newRoadmap, specialization: e.target.value })
              }
              className="input-field"
            />
            <input
              type="text"
              placeholder="Enter image path"
              value={newRoadmap.imagePath}
              onChange={(e) =>
                setNewRoadmap({ ...newRoadmap, imagePath: e.target.value })
              }
              className="input-field"
            />
            <button onClick={handleAddRoadmap} className="add-button">
              Add Roadmap
            </button>
          </div>
        </section>

        <section className="roadmaps-list">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Specialization
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Image Path
                </th>
                <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {roadmaps.map((roadmap) => (
                <tr key={roadmap.roadmapID}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {editingId === roadmap.roadmapID ? (
                      <input
                        type="text"
                        value={roadmap.specialization}
                        onChange={(e) =>
                          handleEditChange(
                            roadmap.roadmapID,
                            "specialization",
                            e.target.value
                          )
                        }
                        className="search-bar"
                      />
                    ) : (
                      roadmap.specialization
                    )}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {editingId === roadmap.roadmapID ? (
                      <input
                        type="text"
                        value={roadmap.imagePath}
                        onChange={(e) =>
                          handleEditChange(
                            roadmap.roadmapID,
                            "imagePath",
                            e.target.value
                          )
                        }
                        className="search-bar"
                      />
                    ) : (
                      roadmap.imagePath
                    )}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {editingId === roadmap.roadmapID ? (
                      <button
                        onClick={() => handleUpdateRoadmap(roadmap.roadmapID)}
                        className="reset-button"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingId(roadmap.roadmapID)}
                        className="reset-button"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteRoadmap(roadmap.roadmapID)}
                      className="reset-button"
                      style={{ backgroundColor: "#e74c3c", marginLeft: "10px" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
