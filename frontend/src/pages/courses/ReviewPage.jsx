import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaArrowLeft } from "react-icons/fa";
import api, { getErrorMessage } from "../../api/client";
import "../../styles/Review.css";

const ReviewPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState({
    rating: 0,
    comment: "",
    submitting: false,
    error: "",
    success: false,
  });

  const handleRatingChange = (rating) => {
    setReview({ ...review, rating });
  };

  const handleCommentChange = (e) => {
    setReview({ ...review, comment: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (review.rating === 0) {
      setReview({ ...review, error: "Please select a rating" });
      return;
    }

    setReview({ ...review, submitting: true, error: "" });

    try {
      // The reviewer is identified by the access token on the server.
      const response = await api.post("/Courses/review", {
        courseID: Number(courseId),
        rating: review.rating,
        comment: review.comment,
      });

      if (response.status === 200) {
        setReview({
          ...review,
          submitting: false,
          success: true,
          error: "",
        });
        setTimeout(() => navigate(`/course/${courseId}`), 2000);
      }
    } catch (error) {
      setReview({
        ...review,
        submitting: false,
        error: getErrorMessage(error, "Failed to submit review"),
      });
    }
  };

  return (
    <div className="review-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="review-container">
        <h2>Leave a Review</h2>
        <p>Share your experience with this course</p>

        {review.error && <div className="error-message">{review.error}</div>}
        {review.success && (
          <div className="success-message">
            Thank you for your review! Redirecting back to course...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="rating-section">
            <label>Your Rating:</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={star <= review.rating ? "star active" : "star"}
                  onClick={() => handleRatingChange(star)}
                />
              ))}
            </div>
          </div>

          <div className="comment-section">
            <label htmlFor="comment">Your Review:</label>
            <textarea
              id="comment"
              value={review.comment}
              onChange={handleCommentChange}
              placeholder="What did you like or dislike about this course?"
              rows={5}
            />
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={review.submitting}
          >
            {review.submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewPage;
