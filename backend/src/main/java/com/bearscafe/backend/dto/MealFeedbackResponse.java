
package com.bearscafe.backend.dto;

import java.time.LocalDateTime;

public class MealFeedbackResponse {

    private final Long feedbackId;
    private final Long mealId;
    private final Integer ratingValue;
    private final String comment;
    private final LocalDateTime createdAt;

    public MealFeedbackResponse(
            Long feedbackId,
            Long mealId,
            Integer ratingValue,
            String comment,
            LocalDateTime createdAt
    ) {
        this.feedbackId = feedbackId;
        this.mealId = mealId;
        this.ratingValue = ratingValue;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Long getFeedbackId() {
        return feedbackId;
    }

    public Long getMealId() {
        return mealId;
    }

    public Integer getRatingValue() {
        return ratingValue;
    }

    public String getComment() {
        return comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
