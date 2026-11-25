import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMoon } from "react-icons/fa6";
import { IoSunny, IoMenu, IoCloseSharp } from "react-icons/io5";
import { useAuth } from "../../context/useAuth";
import "../../styles/Header.css";

const Header = () => {
  const { isLoggedIn, userRole, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("currentMode") ?? "dark"
  );
  const navigate = useNavigate();

  // Handle theme toggle
  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    document.body.classList.toggle("light", theme === "light");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("currentMode", newTheme);
    setTheme(newTheme);
  }, [theme]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModal && !event.target.closest(".modal")) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  const handleLogout = () => {
    logout();
    setShowModal(false);
    navigate("/login");
  };

  // Navigation links
  const commonLinks = [
    { to: "/", label: "Home" },
    { to: "/courses", label: "Courses" },
    { to: "/roadmaps", label: "Roadmaps" },
  ];

  const userLinks = [
    { to: "/my-learning", label: "My Learning" },
    { to: "/community", label: "Community" },
    { to: "/jobs", label: "Job Opportunities" },
    { to: "/profile", label: "Profile" },

    
  ];
  const userDropdownLinks = [
    { to: "/FAQs", label: "FAQs" },
    { to: "/coupons", label: "Coupons" },
    { to: "/bundles", label: "Bundles" },
    { to: "/ToDoList", label: "ToDoList" },
  ];

  const adminLinks = [
    { to: "/community", label: "Community" },
    { to: "/jobs", label: "Jobs" },
    { to: "/coupons", label: "Coupons" },
    { to: "/bundles", label: "Bundles" },
    { to: "/admin/profile", label: "Profile" },
  ];

  const adminDropdownLinks = [
    { to: "/admin/coupons", label: "Coupons Management" },
    { to: "/admin/bundles", label: "Bundles Management" },
    { to: "/admin/jobs", label: "Job Management" },
    { to: "/admin/Courses", label: "Courses Management" },
    { to: "/admin/FAQs", label: "FAQs Management" },
    { to: "/admin/roadmaps", label: "Roadmaps Management" },
    { to: "/ToDoList", label: "ToDoList" },
  ];

  const renderNavItems = () => (
    <>
      {[...commonLinks].map(({ to, label }) => (
        <li key={to}>
          <Link to={to} onClick={() => setShowModal(false)}>
            {label}
          </Link>
        </li>
      ))}

      {isLoggedIn && userRole === "admin" && (
        <>
          {adminLinks.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} onClick={() => setShowModal(false)}>
                {label}
              </Link>
            </li>
          ))}

          {/* DROPDOWN LIST */}
          <li className="dropdown">
            <button className="dropbtn">Management </button>
            <div className="dropdown-content">
              {adminDropdownLinks.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setShowModal(false)}>
                  {label}
                </Link>
              ))}
            </div>
          </li>
        </>
      )}

      {isLoggedIn && userRole === "user" && (
        <>
          {userLinks.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} onClick={() => setShowModal(false)}>
                {label}
              </Link>
            </li>
          ))}
          {/* DROPDOWN LIST */}
          <li className="dropdown">
            <button className="dropbtn">Extra </button>
            <div className="dropdown-content">
              {userDropdownLinks.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setShowModal(false)}>
                  {label}
                </Link>
              ))}
            </div>
          </li>
        </>
      )}

      {isLoggedIn ? (
        <li>
          <Link
            to="/login"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            Logout
          </Link>
        </li>
      ) : (
        <>
          <li>
            <Link to="/login" onClick={() => setShowModal(false)}>
              Login
            </Link>
          </li>
          <li>
            <Link to="/signup" onClick={() => setShowModal(false)}>
              Sign Up
            </Link>
          </li>
        </>
      )}
    </>
  );

  return (
    <header className="flex">
      <div className="parent-avatar flex">
        <Link to="/">
          <motion.img
            initial={{ transform: "scale(0)" }}
            animate={{ transform: "scale(1.1)" }}
            transition={{ damping: 6, type: "spring", stiffness: 100 }}
            src="/logo2.png"
            className="avatarh"
            alt="logo"
            style={{ width: "99px", height: "99px" }}
          />
        </Link>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setShowModal(true)}
        className="menu icon-menu flex"
        aria-label="Open menu"
        aria-expanded={showModal}
        aria-controls="mobile-menu"
      >
        <IoMenu size={20} />
      </button>

      {/* Mobile menu modal */}
      {showModal && (
        <div className="fixed" id="mobile-menu">
          <ul className="modal">
            <li className="modal-header">
              <button
                onClick={() => setShowModal(false)}
                className="icon-cancel"
                aria-label="Close menu"
              >
                <IoCloseSharp size={22} />
              </button>
            </li>
            {renderNavItems()}
          </ul>
        </div>
      )}

      {/* Desktop navigation */}
      <nav>
        <ul className="flex">{renderNavItems()}</ul>
      </nav>

      {/* Theme toggle button */}
      {/* <button
        onClick={toggleTheme}
        className="mode flex"
        title={
          theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
        }
        aria-label={
          theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
        }
      >
        {theme === "dark" ? <FaMoon /> : <IoSunny size={19} />}
      </button> */}
      <label
        className="theme-switch"
        title={
          theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
        }
      >
        <input
          type="checkbox"
          checked={theme === "dark"}
          onChange={toggleTheme}
          aria-label="Toggle Theme"
        />
        <span className="slider round">
          <span className="icons">
            <IoSunny className="sun" size={14} />
            <FaMoon className="moon" size={14} />
          </span>
        </span>
      </label>
    </header>
  );
};

export default Header;
