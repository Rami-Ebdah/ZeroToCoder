import { useState } from "react";
import { FaStar } from "react-icons/fa";

const ReviewsSection = ({ course, userProgress, newReview, setNewReview }) => {
  const [filterRating, setFilterRating] = useState(null);

  const filteredReviews = filterRating
    ? course.reviews.filter((review) => review.rating === filterRating)
    : course.reviews;

  const averageRating = filteredReviews.length
    ? (
        filteredReviews.reduce((sum, review) => sum + review.rating, 0) /
        filteredReviews.length
      ).toFixed(1)
    : course.rating;

  const calculateDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    filteredReviews.forEach((review) => {
      distribution[review.rating]++;
    });

    if (filteredReviews.length) {
      for (let star in distribution) {
        distribution[star] = distribution[star] / filteredReviews.length;
      }
    }

    return distribution;
  };

  const ratingsDistribution = calculateDistribution();

  return (
    <section className="course-section reviews-section">
      <h2 className="section-title">Student Feedback</h2>

      <div className="rating-summary">
        <div className="average-rating">
          <span className="rating-value">{averageRating}</span>
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < Math.floor(averageRating) ? "filled" : ""}
              />
            ))}
          </div>
          <span className="rating-label">Course Rating</span>
        </div>

        <div className="rating-bars">
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className={`rating-bar ${filterRating === star ? "active" : ""}`}
              onClick={() =>
                setFilterRating(filterRating === star ? null : star)
              }
            >
              <span className="star-label">{star} star</span>
              <div className="bar-container">
                <div
                  className="bar"
                  style={{
                    width: `${(ratingsDistribution[star] || 0) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="percentage">
                {((ratingsDistribution[star] || 0) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="reviews-list">
        <div className="reviews-header">
          <h3 className="reviews-title">Student Reviews</h3>
          {filterRating && (
            <div className="filter-indicator">
              Showing {filterRating}-star reviews only
              <button
                className="clear-filter"
                onClick={() => setFilterRating(null)}
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
        {filteredReviews?.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.reviewID} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <img
                    src={review.userImage || "/images/default-user.jpg"}
                    alt={review.userName}
                    className="reviewer-avatar"
                  />
                  <div className="reviewer-details">
                    <h4 className="reviewer-name">{review.userName}</h4>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < review.rating ? "filled" : ""}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="review-date">
                  {new Date(review.reviewDate).toLocaleDateString()}
                </span>
              </div>
              <p className="review-content">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="no-reviews">
            {filterRating
              ? `No ${filterRating}-star reviews for this course.`
              : "No reviews yet for this course."}
          </p>
        )}
      </div>

      {userProgress.enrolled && !userProgress.feedbackGiven && (
        <div className="add-review">
          <h3>Add Your Review</h3>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`star ${newReview.rating >= star ? "filled" : ""}`}
                onClick={() => setNewReview({ ...newReview, rating: star })}
              />
            ))}
          </div>
          <textarea
            className="review-textarea"
            placeholder="Share your thoughts about this course..."
            value={newReview.comment}
            onChange={(e) =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
          ></textarea>
          <button className="submit-review-btn">Submit Review</button>
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
