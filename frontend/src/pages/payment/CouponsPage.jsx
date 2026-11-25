import { useEffect, useState } from "react";
import api from "../../api/client";
import "../../styles/Coupons.css";
import Header from "../../components/layout/Header.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await api.get("/Coupons");
        setCoupons(response.data);
      } catch {
        toast.error("Error loading coupons", {
          position: "top-center",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleUseCoupon = async (couponCode) => {
    try {
      await navigator.clipboard.writeText(couponCode);
      toast.success(`Coupon ${couponCode} copied!`, {
        position: "top-center",
        autoClose: 3000,
      });
      localStorage.setItem("selectedCoupon", couponCode);
    } catch {
      toast.error("Failed to copy coupon", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div id="up">
      <Header />
      <ToastContainer />
      <div className="coupons-container">
        <h2>Available Coupons</h2>
        {loading ? (
          <p>Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p>No coupons available.</p>
        ) : (
          <div className="coupons-list">
            {coupons.map((coupon) => (
              <div key={coupon.couponID} className="coupon-card">
                <div className="coupon-header">
                  <h3>{coupon.code}</h3>
                  <span className="discount-badge">{coupon.discount}% OFF</span>
                </div>
                <p>{coupon.description}</p>
                <p>Valid until: {coupon.validUntil}</p>
                <button
                  onClick={() => handleUseCoupon(coupon.code)}
                  className="apply-coupon-btn"
                >
                  Use Coupon
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;
