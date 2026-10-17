
package com.bearscafe.backend.service;

import com.bearscafe.backend.dto.MealAnalyticsResponse;
import com.bearscafe.backend.dto.MealFeedbackResponse;
import com.bearscafe.backend.entity.Feedback;
import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.entity.Rating;
import com.bearscafe.backend.exception.ResourceNotFoundException;
import com.bearscafe.backend.repository.FeedbackRepository;
import com.bearscafe.backend.repository.MealRepository;
import com.bearscafe.backend.repository.RatingRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MealAnalyticsService {

    private final MealRepository mealRepository;
    private final RatingRepository ratingRepository;
    private final FeedbackRepository feedbackRepository;

    public MealAnalyticsService(
            MealRepository mealRepository,
            RatingRepository ratingRepository,
            FeedbackRepository feedbackRepository
    ) {
        this.mealRepository = mealRepository;
        this.ratingRepository = ratingRepository;
        this.feedbackRepository = feedbackRepository;
    }

    @Transactional(readOnly = true)
    public List<MealAnalyticsResponse> getMealAnalytics() {

        List<Meal> meals = mealRepository.findAll();

        if (meals.isEmpty()) {
            return List.of();
        }

        List<Long> mealIds = meals.stream()
                .map(Meal::getId)
                .toList();

        Map<Long, List<Rating>> ratingsByMeal =
                ratingRepository.findByMealIdIn(mealIds)
                        .stream()
                        .collect(Collectors.groupingBy(
                                rating -> rating.getMeal().getId()
                        ));

        List<MealAnalyticsResponse> results = new ArrayList<>();

        for (Meal meal : meals) {

            List<Rating> ratings = ratingsByMeal.getOrDefault(
                    meal.getId(),
                    List.of()
            );

            Map<Integer, Long> distribution = new LinkedHashMap<>();

            for (int star = 1; star <= 5; star++) {
                distribution.put(star, 0L);
            }

            long totalScore = 0;

            for (Rating rating : ratings) {
                int value = rating.getRatingValue();

                totalScore += value;

                distribution.put(
                        value,
                        distribution.getOrDefault(value, 0L) + 1
                );
            }

            long totalRatings = ratings.size();

            double averageRating = totalRatings == 0
                    ? 0
                    : Math.round(
                            (totalScore * 100.0) / totalRatings
                    ) / 100.0;

            results.add(new MealAnalyticsResponse(
                    meal.getId(),
                    meal.getName(),
                    meal.getMealDate(),
                    meal.getMealPeriod(),
                    meal.getImageUrl(),
                    averageRating,
                    totalRatings,
                    distribution
            ));
        }

        results.sort(
                Comparator.comparing(
                        MealAnalyticsResponse::getMealDate,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                ).thenComparing(
                        MealAnalyticsResponse::getMealId,
                        Comparator.reverseOrder()
                )
        );

        return results;
    }

    @Transactional(readOnly = true)
    public List<MealFeedbackResponse> getMealFeedback(Long mealId) {

        if (!mealRepository.existsById(mealId)) {
            throw new ResourceNotFoundException(
                    "Meal not found."
            );
        }

        List<Feedback> feedbackList =
                feedbackRepository.findByMealIdOrderByCreatedAtDesc(mealId);

        List<MealFeedbackResponse> results = new ArrayList<>();

        for (Feedback feedback : feedbackList) {

            Integer ratingValue = ratingRepository
                    .findByStudentIdAndMealId(
                            feedback.getStudent().getId(),
                            mealId
                    )
                    .map(Rating::getRatingValue)
                    .orElse(null);

            results.add(new MealFeedbackResponse(
                    feedback.getId(),
                    mealId,
                    ratingValue,
                    feedback.getComment(),
                    feedback.getCreatedAt()
            ));
        }

        return results;
    }
}
