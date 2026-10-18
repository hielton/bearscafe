import {useEffect, useState} from "react";
import api from "../../api/axios";
import "./MealCard.css";
import { getMealImageUrl } from "../../utils/mealImage";

function MealCard({ meal }) {
  const [rating, setRating] = useState(0);

  const [hoveredRating, setHoveredRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [loadingReview, setLoadingReview] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [hasExistingReview, setHasExistingReview] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const loadReview = async () => {
      try {
        const response =
          await api.get(
            `/reviews/meal/${meal.id}/my-review`
          );

        /*
         * 204 No Content means the student
         * has not reviewed this meal yet.
         */
        if (
          response.status === 204 ||
          !response.data
        ) {
          setRating(0);
          setComment("");
          setHasExistingReview(false);
          return;
        }

        setRating(
          response.data.ratingValue || 0
        );

        setComment(
          response.data.comment || ""
        );

        setHasExistingReview(true);

      } catch (error) {
        console.error(
          "Error loading review:",
          error
        );

        setErrorMessage(
          "We could not load your existing review."
        );
      } finally {
        setLoadingReview(false);
      }
    };

    loadReview();
  }, [meal.id]);

  const handleRatingChange = (
    newRating
  ) => {
    setRating(newRating);

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleCommentChange = (
    event
  ) => {
    setComment(
      event.target.value
    );

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (rating === 0) {
      setErrorMessage(
        "Please select a star rating before submitting."
      );

      return;
    }

    if (
      rating <= 2 &&
      comment.trim() === ""
    ) {
      setErrorMessage(
        "Please tell us what could be improved for a 1 or 2 star rating."
      );

      return;
    }

    try {
      setSubmitting(true);

      const wasExistingReview =
        hasExistingReview;

      const response =
        await api.post(
          `/reviews/meal/${meal.id}`,
          {
            ratingValue: rating,
            comment: comment.trim(),
          }
        );

      setRating(
        response.data.ratingValue
      );

      setComment(
        response.data.comment || ""
      );

      setHasExistingReview(true);

      setSuccessMessage(
        wasExistingReview
          ? "Your review has been updated."
          : "Thank you! Your review has been submitted."
      );

    } catch (error) {
      console.error(
        "Error submitting review:",
        error
      );

      const backendMessage =
        error.response?.data?.message;

      if (backendMessage) {
        setErrorMessage(
          backendMessage
        );
      } else if (
        error.response?.status === 403
      ) {
        setErrorMessage(
          "Only student accounts can submit meal reviews."
        );
      } else {
        setErrorMessage(
          "We could not save your review. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayedRating =
    hoveredRating || rating;

  const commentRequired =
    rating > 0 &&
    rating <= 2;

  return (
    <article className="meal-card">
      <div className="meal-card-image-wrapper">
        {getMealImageUrl(meal) ? (
          <img
            src={getMealImageUrl(meal)}
            alt={meal.name}
            className="meal-card-image"
            loading="lazy"
          />
        ) : (
          <div className="meal-image-placeholder">
            <span className="placeholder-icon">🍽️</span>
            <span>BearsCafe</span>
          </div>
        )}
                
        <span className="meal-period-badge">
          {meal.mealPeriod}
        </span>
      </div>

      <div className="meal-card-content">

        <div className="meal-information">
          <h3>
            {meal.name}
          </h3>

          {meal.description && (
            <p className="meal-description">
              {meal.description}
            </p>
          )}
        </div>

        <div className="meal-review-divider" />

        <div className="review-section">

          <div className="review-heading">
            <div>
              <h4>
                {hasExistingReview
                  ? "Your Review"
                  : "Rate Your Meal"}
              </h4>

              <p>
                {hasExistingReview
                  ? "You can update your review anytime."
                  : "How was your meal today?"}
              </p>
            </div>

            {hasExistingReview && (
              <span className="reviewed-badge">
                ✓ Reviewed
              </span>
            )}
          </div>

          {loadingReview ? (
            <div className="review-loading">
              Loading your review...
            </div>
          ) : (
            <form
              className="review-form"
              onSubmit={handleSubmit}
            >

              <div className="rating-row">

                <div
                  className="star-rating"
                  role="radiogroup"
                  aria-label={
                    `Rate ${meal.name}`
                  }
                >

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        className={
                          `star-button ${
                            star <= displayedRating
                              ? "star-selected"
                              : ""
                          }`
                        }
                        onClick={() =>
                          handleRatingChange(
                            star
                          )
                        }
                        onMouseEnter={() =>
                          setHoveredRating(
                            star
                          )
                        }
                        onMouseLeave={() =>
                          setHoveredRating(
                            0
                          )
                        }
                        aria-label={
                          `${star} ${
                            star === 1
                              ? "star"
                              : "stars"
                          }`
                        }
                        aria-pressed={
                          rating === star
                        }
                      >
                        ★
                      </button>
                    )
                  )}
                </div>

                {rating > 0 && (
                  <span className="rating-label">
                    {getRatingLabel(
                      rating
                    )}
                  </span>
                )}

              </div>

              <div className="comment-group">

                <div className="comment-label-row">
                  <label
                    htmlFor={
                      `comment-${meal.id}`
                    }
                  >
                    Your feedback
                  </label>

                  <span
                    className={
                      commentRequired
                        ? "required-label"
                        : "optional-label"
                    }
                  >
                    {commentRequired
                      ? "Required"
                      : "Optional"}
                  </span>
                </div>

                <textarea
                  id={
                    `comment-${meal.id}`
                  }
                  value={comment}
                  onChange={
                    handleCommentChange
                  }
                  placeholder={
                    commentRequired
                      ? "Tell us what could be improved..."
                      : "Share anything else about your meal..."
                  }
                  maxLength={2000}
                  rows={3}
                  required={
                    commentRequired
                  }
                />

                <div className="comment-footer">
                  <span>
                    {commentRequired
                      ? "Feedback is required for 1–2 star ratings."
                      : "Your feedback helps us improve BearsCafe."}
                  </span>

                  <span className="character-count">
                    {comment.length}/2000
                  </span>
                </div>

              </div>

              {errorMessage && (
                <div
                  className="review-message review-error"
                  role="alert"
                >
                  <span>!</span>

                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div
                  className="review-message review-success"
                  role="status"
                >
                  <span>✓</span>

                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                className="submit-review-button"
                disabled={
                  submitting ||
                  rating === 0
                }
              >
                {submitting
                  ? "Saving Review..."
                  : hasExistingReview
                    ? "Update Review"
                    : "Submit Review"}
              </button>

            </form>
          )}
        </div>
      </div>
    </article>
  );
}

function getRatingLabel(rating) {
  switch (rating) {
    case 1:
      return "Poor";

    case 2:
      return "Needs improvement";

    case 3:
      return "Good";

    case 4:
      return "Great";

    case 5:
      return "Excellent";

    default:
      return "";
  }
}

export default MealCard;