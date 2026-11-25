import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/client";
import "../../styles/BundlePaymentPage.css";
import Header from "../../components/layout/Header.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoMdPricetag } from "react-icons/io";

const BundlePaymentPage = () => {
  const { bundleID } = useParams();
  const navigate = useNavigate();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const savedBundle = JSON.parse(localStorage.getItem("selectedBundle") || "null");
        // Only trust the cached bundle if it is the one in the URL.
        if (savedBundle && String(savedBundle.bundleID) === String(bundleID)) {
          const parsedBundle = savedBundle;
          setBundle(parsedBundle);
          setFinalPrice(parsedBundle.discountedPrice);
          setLoading(false);
          return;
        }

        const response = await api.get(`/Bundles/${bundleID}`);
        setBundle(response.data);
        setFinalPrice(response.data.discountedPrice);
      } catch {
        toast.error("Error loading bundle details", {
          position: "top-center",
          autoClose: 3000,
        });
        navigate("/bundles");
      } finally {
        setLoading(false);
      }
    };

    fetchBundle();
  }, [bundleID, navigate]);

  useEffect(() => {
    if (bundle && discount > 0) {
      const discountedAmount = bundle.discountedPrice * (1 - discount / 100);
      setFinalPrice(discountedAmount.toFixed(2));
    } else if (bundle) {
      setFinalPrice(bundle.discountedPrice);
    }
  }, [discount, bundle]);

  const applyCoupon = async () => {
    try {
      const response = await api.get("/Coupons");

      const matchedCoupon = response.data.find(
        (coupon) =>
          coupon.code?.toLowerCase() === couponCode.trim().toLowerCase() &&
          (!coupon.validUntil || new Date(coupon.validUntil) >= new Date())
      );

      if (matchedCoupon) {
        setDiscount(matchedCoupon.discount);
        setCouponApplied(true);
        toast.success("Coupon applied successfully!");
      } else {
        toast.error("Invalid or expired coupon code");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Something went wrong while applying the coupon"));
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setCouponApplied(false);
    toast.info("Coupon removed");
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Payment is simulated: card details never leave the browser.
      await api.post(`/Bundles/enroll/${bundleID}`);

      toast.success("Enrolled in bundle successfully!", {
        position: "top-center",
        autoClose: 3000,
      });

      navigate("/my-learning");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to enroll. Please try again."), {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="payment-loading">
          <p>Loading bundle details...</p>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div>
        <Header />
        <div className="payment-error">
          <p>Bundle not found</p>
          <button onClick={() => navigate("/bundles")}>Back to Bundles</button>
        </div>
      </div>
    );
  }

  const courseList = bundle.courses.split(",");

  return (
    <div id="up">
      <Header />
      <ToastContainer />
      <div className="payment-container">
        <div className="payment-header">
          <h2>Complete Your Purchase</h2>
          <p className="payment-subtitle">
            Review your bundle and enter payment details
          </p>
        </div>

        <div className="payment-content">
          <div className="bundle-summary">
            <h3>Bundle Summary</h3>
            <div className="summary-card">
              <h4>{bundle.name}</h4>

              <div className="included-courses">
                <h5>Included Courses:</h5>
                <ul>
                  {courseList.map((course, index) => (
                    <li key={index}>
                      <span className="course-checkmark">✓</span>{" "}
                      {course.trim()}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="price-summary">
                <div className="original-price">
                  <span>Original Price:</span>
                  <span>${bundle.originalPrice}</span>
                </div>
                <div className="discounted-price">
                  <span>Discounted Price:</span>
                  <span>${bundle.discountedPrice}</span>
                </div>
                {couponApplied && (
                  <div className="coupon-discount">
                    <span>Coupon Discount ({discount}%):</span>
                    <span>
                      -${(bundle.discountedPrice * (discount / 100)).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="total-price">
                  <span>Total to Pay:</span>
                  <span>${finalPrice}</span>
                </div>
                <div className="coupon-section">
                  {!couponApplied ? (
                    <div className="coupon-input-group">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                      />
                      <button
                        type="button"
                        className="apply-coupon-btn"
                        onClick={applyCoupon}
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="coupon-applied">
                      <span>
                        Coupon applied: {couponCode} ({discount}% off)
                      </span>
                      <button
                        type="button"
                        className="remove-coupon-btn"
                        onClick={removeCoupon}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="browse-coupons-btn"
                  onClick={() => navigate("/coupons")}
                >
                  <IoMdPricetag /> Browse Available Coupons
                </button>
              </div>
            </div>
          </div>

          <div className="payment-form-container">
            <form onSubmit={handleSubmitPayment} className="payment-form">
              <h3>Payment Method</h3>

              <div className="payment-methods">
                <label className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="creditCard"
                    checked={paymentMethod === "creditCard"}
                    onChange={() => setPaymentMethod("creditCard")}
                  />
                  <span>Credit/Debit Card</span>
                </label>

                <label className="payment-method">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                  />
                  <span>PayPal</span>
                </label>
              </div>

              {paymentMethod === "creditCard" && (
                <div className="card-details">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      value={cardDetails.cardName}
                      onChange={handleCardChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div className="paypal-notice">
                  <p>
                    You will be redirected to PayPal to complete your payment.
                  </p>
                </div>
              )}

              
              <button
                type="submit"
                className="submit-payment-btn"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Enroll for $${finalPrice}`}
              </button>

              <div className="secure-payment-note">
                <span className="lock-icon">🔒</span>
                <span>Your payment is secure and encrypted</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundlePaymentPage;
