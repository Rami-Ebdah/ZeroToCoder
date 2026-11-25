import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import "../../styles/SavingBundlesPage.css";
import Header from "../../components/layout/Header.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SavingBundlesPage = () => {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await api.get("/Bundles");
        const data = response.data;
        setBundles(data);
      } catch (error) {
        console.error("Failed to fetch bundles:", error);
        toast.error("Error loading bundles", {
          position: "top-center",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  const handleEnroll = async (bundle) => {
    setIsProcessing(true);
    try {
      const formattedBundle = {
        ...bundle,
        price: bundle.discountedPrice,
      };
      localStorage.setItem("selectedBundle", JSON.stringify(formattedBundle));
      navigate(`/bundle-payment/${bundle.bundleID}`);
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Failed to initiate enrollment", {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="up">
      <Header />
      <ToastContainer />
      <div className="bundles-container">
        <div className="bundles-header">
          <h2>Course Bundles</h2>
          <p className="bundles-subtitle">
            Save money with our expertly curated course bundles
          </p>
        </div>

        {loading ? (
          <p>Loading bundles...</p>
        ) : (
          <div className="bundles-list">
            {bundles.map((bundle) => {
              const savings = bundle.originalPrice - bundle.discountedPrice;
              const discountPercent = Math.round(
                (savings / bundle.originalPrice) * 100
              );
              const courseList = bundle.courses.split(",");

              return (
                <div key={bundle.bundleID} className="bundle-card">
                  <div className="bundle-content">
                    <div className="bundle-main">
                      <h3>{bundle.name}</h3>
                      <div className="bundle-courses">
                        <h4>Includes:</h4>
                        <ul>
                          {courseList.map((course) => (
                            <li key={`${bundle.bundleID}-${course.trim()}`}>
                              <span className="course-checkmark">✓</span>{" "}
                              {course.trim()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bundle-bottom">
                      <div className="bundle-pricing">
                        <div className="price-original">
                          ${bundle.originalPrice}
                        </div>
                        <div className="price-discounted">
                          ${bundle.discountedPrice}
                        </div>
                        <div className="price-savings">
                          Save ${savings} ({discountPercent}%)
                        </div>
                      </div>

                      <button
                        onClick={() => handleEnroll(bundle)}
                        className="enroll-btn"
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Please wait..." : "Enroll Now"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingBundlesPage;
