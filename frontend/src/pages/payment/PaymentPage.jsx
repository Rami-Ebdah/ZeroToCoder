import { useState, useEffect } from "react";
import api, { getErrorMessage } from "../../api/client";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaLock,
  FaCheck,
  FaCreditCard,
  FaPaypal,
} from "react-icons/fa";
import { IoMdPricetag } from "react-icons/io";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Payment.css";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/Courses/${courseId}`);
        setCourse(data);
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load course details"));
        navigate("/courses");
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  const applyCoupon = async () => {
    try {
      const { data: coupons } = await api.get("/Coupons");
      const code = couponCode.trim().toLowerCase();
      const matchedCoupon = coupons.find(
        (coupon) =>
          coupon.code?.toLowerCase() === code &&
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

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Payment is simulated: card details never leave the browser.
      // Integrate a PCI-compliant provider (e.g. Stripe Elements) before accepting real payments.
      await api.post(`/Enrollments/${courseId}`);

      toast.success(`Enrolled in course "${course.courseTitle}" successfully!`, {
        position: "top-center",
      });

      navigate("/my-learning", {
        state: { newlyEnrolled: true, courseId },
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Payment failed. Please try again"));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!course)
    return <div className="payment-container loading-state">Loading...</div>;

  return (
    <div className="payment-container">
      <ToastContainer />
      <div className="back-button">
        <button onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Course
        </button>
      </div>

      <div className="payment-grid">
        <div className="payment-summary">
          <h2>Order Summary</h2>
          <div className="course-cardp">
            <img
              src={course.imgPath || "/images/default-course.jpg"}
              alt={course.courseTitle}
            />
            <div className="course-details">
              <h3>{course.courseTitle}</h3>
              <p className="item-type">Course</p>

              <div className="price-section">
                <span className="current-price">
                  ${course.price?.toFixed(2)}
                </span>
                {course.originalPrice && (
                  <span className="original-price">
                    <del>${course.originalPrice.toFixed(2)}</del>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Original Price:</span>
              <span>${course.price?.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div className="price-row discount">
                <span>Discount ({discount}%):</span>
                <span>- ${((course.price * discount) / 100).toFixed(2)}</span>
              </div>
            )}

            <div className="price-row total">
              <span>Total:</span>
              <span>
                ${(course.price - (course.price * discount) / 100).toFixed(2)}
              </span>
            </div>

            <div className="coupon-section">
              <h3>Have a coupon?</h3>
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                />
                {couponApplied ? (
                  <button onClick={removeCoupon} className="remove-coupon-btn">
                    Remove
                  </button>
                ) : (
                  <button onClick={applyCoupon}>Apply</button>
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

        <div className="payment-method-section">
          <h2>Payment Method</h2>

          <div className="method-tabs">
            <button
              className={paymentMethod === "card" ? "active" : ""}
              onClick={() => setPaymentMethod("card")}
            >
              <FaCreditCard /> Credit Card
            </button>
            <button
              className={paymentMethod === "paypal" ? "active" : ""}
              onClick={() => setPaymentMethod("paypal")}
            >
              <FaPaypal /> PayPal
            </button>
          </div>

          {paymentMethod === "card" && (
            <div className="card-form">
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Name on card"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength="16"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    maxLength="5"
                  />
                </div>
                
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength="4"
                  />
                </div>
              </div>
              <div className="card-logos">
                <img src="/images/visa.png" alt="Visa" />
                <img src="/images/mastercard.png" alt="Mastercard" />
              </div>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="paypal-method">
              <p>
                You&apos;ll be redirected to PayPal to complete your payment
                securely.
              </p>
            </div>
          )}

          <button
            className="pay-now-btn"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="spinner">Processing Payment...</span>
            ) : (
              <>
                <FaCheck /> Pay $
                {(course.price - (course.price * discount) / 100).toFixed(2)}
              </>
            )}
          </button>

          <div className="security-assurance">
            <p>
              <FaLock /> 256-bit SSL secure payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
