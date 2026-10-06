package com.bearscafe.backend.dto;

public class MealReviewRequest {

    private Integer ratingValue;
    private String comment;

    public MealReviewRequest() {
    }

    public Integer getRatingValue() {
        return ratingValue;
    }

    public void setRatingValue(
            Integer ratingValue
    ) {
        this.ratingValue = ratingValue;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(
            String comment
    ) {
        this.comment = comment;
    }
}