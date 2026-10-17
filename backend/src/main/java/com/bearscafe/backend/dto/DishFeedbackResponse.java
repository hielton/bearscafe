
package com.bearscafe.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DishFeedbackResponse {

    private final Long feedbackId;
    private final Long mealId;
    private final LocalDate mealDate;
    private final String mealPeriod;
    private final Integer ratingValue;
    private final String comment;
    private final LocalDateTime createdAt;

    public DishFeedbackResponse(
            Long feedbackId,
            Long mealId,
            LocalDate mealDate,
            String mealPeriod,
            Integer ratingValue,
            String comment,
            LocalDateTime createdAt
    ) {
        this.feedbackId = feedbackId;
        this.mealId = mealId;
        this.mealDate = mealDate;
        this.mealPeriod = mealPeriod;
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

    public LocalDate getMealDate() {
        return mealDate;
    }

    public String getMealPeriod() {
        return mealPeriod;
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
