
package com.bearscafe.backend.dto;

import java.time.LocalDate;

public class DishRatingHistoryResponse {

    private final Long mealId;
    private final LocalDate mealDate;
    private final String mealPeriod;
    private final double averageRating;
    private final long totalRatings;

    public DishRatingHistoryResponse(
            Long mealId,
            LocalDate mealDate,
            String mealPeriod,
            double averageRating,
            long totalRatings
    ) {
        this.mealId = mealId;
        this.mealDate = mealDate;
        this.mealPeriod = mealPeriod;
        this.averageRating = averageRating;
        this.totalRatings = totalRatings;
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

    public double getAverageRating() {
        return averageRating;
    }

    public long getTotalRatings() {
        return totalRatings;
    }
}
