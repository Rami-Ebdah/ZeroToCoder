import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../../components/layout/Header";
import {
  FaCode,
  FaDatabase,
  FaLaptopCode,
  FaChartLine,
  FaShieldAlt,
  FaAndroid,
  FaApple,
  FaServer,
  FaRobot,
  FaChartBar,
  FaSearch,
  FaStar,
  FaRegStar,
  FaReact,
  FaNodeJs,
} from "react-icons/fa";
import { SiMysql } from "react-icons/si";

import "../../styles/Roadmaps.css";
import { Link } from "react-router-dom";

const roadmaps = [
  { name: "Frontend", icon: <FaCode />, category: "role" },
  { name: "Backend", icon: <FaServer />, category: "role" },
  { name: "DevOps", icon: <FaDatabase />, category: "role" },
  { name: "Full Stack", icon: <FaLaptopCode />, category: "role" },
  { name: "AI Engineer", icon: <FaRobot />, category: "role" },
  { name: "Data Analyst", icon: <FaChartBar />, category: "role" },
  { name: "Android", icon: <FaAndroid />, category: "platform" },
  { name: "iOS", icon: <FaApple />, category: "platform" },
  { name: "Cybersecurity", icon: <FaShieldAlt />, category: "role" },
  { name: "Data Science", icon: <FaChartLine />, category: "role" },
  { name: "Node.js", icon: <FaNodeJs />, category: "skill" },
  { name: "SQL", icon: <SiMysql />, category: "skill" },
  { name: "React", icon: <FaReact />, category: "skill" },
];

export default function RoadmapsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    setFavorites(savedFavorites);
  }, []);

  const toggleFavorite = (name) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name];
      // Save to localStorage
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const filteredRoadmaps = roadmaps.filter((rm) => {
    const matchesSearch = rm.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "favorites" && favorites.includes(rm.name)) ||
      rm.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="up" className="roadmap-page-container">
      <Header />
      <main className="roadmap-page">
        <div className="roadmap-header">
          <motion.h1
            className="title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Developer Roadmaps
          </motion.h1>
          <motion.p
            className="subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Community-curated roadmaps to guide your learning journey
          </motion.p>

          <motion.div
            className="search-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for a roadmap..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-bar"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="clear-search-button"
              >
                ✕
              </button>
            )}
          </motion.div>

          <motion.div
            className="category-tabs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <button
              className={`tab ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All Roadmaps
            </button>
            <button
              className={`tab ${activeCategory === "role" ? "active" : ""}`}
              onClick={() => setActiveCategory("role")}
            >
              Role-based
            </button>
            <button
              className={`tab ${activeCategory === "Skill" ? "active" : ""}`}
              onClick={() => setActiveCategory("skill")}
            >
              Skill-based
            </button>
            <button
              className={`tab ${activeCategory === "platform" ? "active" : ""}`}
              onClick={() => setActiveCategory("platform")}
            >
              Platform
            </button>
            <button
              className={`tab ${
                activeCategory === "favorites" ? "active" : ""
              }`}
              onClick={() => setActiveCategory("favorites")}
            >
              Favorites {favorites.length > 0 && `(${favorites.length})`}
            </button>
          </motion.div>
        </div>

        <div className="grid-container">
          {filteredRoadmaps.length > 0 ? (
            filteredRoadmaps.map((rm, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="card-wrapper"
              >
                <Link
                  to={`/roadmaps/${rm.name.toLowerCase().replace(/ /g, "-")}`}
                  className="card-link"
                >
                  <div className="card">
                    <div className="card-header">
                      <div className="icon">{rm.icon}</div>
                      <button
                        className={`favorite-button ${
                          favorites.includes(rm.name) ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(rm.name);
                        }}
                      >
                        {favorites.includes(rm.name) ? (
                          <FaStar />
                        ) : (
                          <FaRegStar />
                        )}
                      </button>
                    </div>
                    <p className="card-title">{rm.name}</p>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>No roadmaps found matching your search</p>
              <button
                className="reset-button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
