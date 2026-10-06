package com.bearscafe.backend.dto;

public class MealReviewResponse {

    private Long mealId;
    private Integer ratingValue;
    private String comment;
    private String message;

    public MealReviewResponse(
            Long mealId,
            Integer ratingValue,
            String comment,
            String message
    ) {
        this.mealId = mealId;
        this.ratingValue = ratingValue;
        this.comment = comment;
        this.message = message;
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

    public String getMessage() {
        return message;
    }
}