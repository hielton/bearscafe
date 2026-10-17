
package com.bearscafe.backend.dto;

import java.util.List;
import java.util.Map;

public class DishAnalyticsResponse {

    private final Long dishId;
    private final String dishName;
    private final long timesServed;
    private final long totalRatings;
    private final double averageRating;
    private final Map<Integer, Long> ratingDistribution;
    private final List<DishRatingHistoryResponse> ratingHistory;

    public DishAnalyticsResponse(
            Long dishId,
            String dishName,
            long timesServed,
            long totalRatings,
            double averageRating,
            Map<Integer, Long> ratingDistribution,
            List<DishRatingHistoryResponse> ratingHistory
    ) {
        this.dishId = dishId;
        this.dishName = dishName;
        this.timesServed = timesServed;
        this.totalRatings = totalRatings;
        this.averageRating = averageRating;
        this.ratingDistribution = ratingDistribution;
        this.ratingHistory = ratingHistory;
    }

    public Long getDishId() {
        return dishId;
    }

    public String getDishName() {
        return dishName;
    }

    public long getTimesServed() {
        return timesServed;
    }

    public long getTotalRatings() {
        return totalRatings;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public Map<Integer, Long> getRatingDistribution() {
        return ratingDistribution;
    }

    public List<DishRatingHistoryResponse> getRatingHistory() {
        return ratingHistory;
    }
}
