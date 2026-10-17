
package com.bearscafe.backend.dto;

import java.time.LocalDate;
import java.util.Map;

public class MealAnalyticsResponse {

    private final Long mealId;
    private final String mealName;
    private final LocalDate mealDate;
    private final String mealPeriod;
    private final String imageUrl;
    private final double averageRating;
    private final long totalRatings;
    private final Map<Integer, Long> ratingDistribution;

    public MealAnalyticsResponse(
            Long mealId,
            String mealName,
            LocalDate mealDate,
            String mealPeriod,
            String imageUrl,
            double averageRating,
            long totalRatings,
            Map<Integer, Long> ratingDistribution
    ) {
        this.mealId = mealId;
        this.mealName = mealName;
        this.mealDate = mealDate;
        this.mealPeriod = mealPeriod;
        this.imageUrl = imageUrl;
        this.averageRating = averageRating;
        this.totalRatings = totalRatings;
        this.ratingDistribution = ratingDistribution;
    }

    public Long getMealId() {
        return mealId;
    }

    public String getMealName() {
        return mealName;
    }

    public LocalDate getMealDate() {
        return mealDate;
    }

    public String getMealPeriod() {
        return mealPeriod;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public long getTotalRatings() {
        return totalRatings;
    }

    public Map<Integer, Long> getRatingDistribution() {
        return ratingDistribution;
    }
}
