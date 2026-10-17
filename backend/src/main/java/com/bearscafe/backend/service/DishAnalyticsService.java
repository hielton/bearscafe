
package com.bearscafe.backend.service;

import com.bearscafe.backend.dto.DishAnalyticsResponse;
import com.bearscafe.backend.dto.DishFeedbackResponse;
import com.bearscafe.backend.dto.DishRatingHistoryResponse;
import com.bearscafe.backend.entity.Dish;
import com.bearscafe.backend.entity.Feedback;
import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.entity.MealStatus;
import com.bearscafe.backend.entity.Rating;
import com.bearscafe.backend.exception.ResourceNotFoundException;
import com.bearscafe.backend.repository.DishRepository;
import com.bearscafe.backend.repository.FeedbackRepository;
import com.bearscafe.backend.repository.MealRepository;
import com.bearscafe.backend.repository.RatingRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DishAnalyticsService {

    private final DishRepository dishRepository;
    private final MealRepository mealRepository;
    private final RatingRepository ratingRepository;
    private final FeedbackRepository feedbackRepository;

    public DishAnalyticsService(
            DishRepository dishRepository,
            MealRepository mealRepository,
            RatingRepository ratingRepository,
            FeedbackRepository feedbackRepository
    ) {
        this.dishRepository = dishRepository;
        this.mealRepository = mealRepository;
        this.ratingRepository = ratingRepository;
        this.feedbackRepository = feedbackRepository;
    }

    private boolean isServed(Meal meal) {
        return meal.getStatus() == MealStatus.PUBLISHED
                && meal.getMealDate() != null
                && !meal.getMealDate().isAfter(LocalDate.now());
    }

    private double calculateAverage(List<Rating> ratings) {
        if (ratings.isEmpty()) {
            return 0.0;
        }

        long totalScore = ratings.stream()
                .mapToLong(Rating::getRatingValue)
                .sum();

        return Math.round(
                totalScore * 100.0 / ratings.size()
        ) / 100.0;
    }

    private Map<Integer, Long> createDistribution(
            List<Rating> ratings
    ) {
        Map<Integer, Long> distribution = new LinkedHashMap<>();

        for (int star = 1; star <= 5; star++) {
            distribution.put(star, 0L);
        }

        for (Rating rating : ratings) {
            int value = rating.getRatingValue();

            distribution.put(
                    value,
                    distribution.getOrDefault(value, 0L) + 1
            );
        }

        return distribution;
    }

    @Transactional(readOnly = true)
    public List<DishAnalyticsResponse> getDishAnalytics() {

        List<Dish> dishes = dishRepository.findAll();
        List<Meal> meals = mealRepository.findAll();

        Map<Long, List<Meal>> mealsByDish = meals.stream()
                .filter(meal -> meal.getDish() != null)
                .collect(Collectors.groupingBy(
                        meal -> meal.getDish().getId()
                ));

        List<Meal> servedMeals = meals.stream()
                .filter(this::isServed)
                .toList();

        List<Long> servedMealIds = servedMeals.stream()
                .map(Meal::getId)
                .toList();

        Map<Long, List<Rating>> ratingsByMeal =
                servedMealIds.isEmpty()
                        ? Map.of()
                        : ratingRepository.findByMealIdIn(servedMealIds)
                                .stream()
                                .collect(Collectors.groupingBy(
                                        rating -> rating.getMeal().getId()
                                ));

        List<DishAnalyticsResponse> results = new ArrayList<>();

        for (Dish dish : dishes) {

            List<Meal> dishMeals = mealsByDish.getOrDefault(
                    dish.getId(),
                    List.of()
            );

            List<Meal> servedDishMeals = dishMeals.stream()
                    .filter(this::isServed)
                    .sorted(
                            Comparator.comparing(
                                    Meal::getMealDate
                            ).thenComparing(Meal::getId)
                    )
                    .toList();

            List<Rating> allRatings = new ArrayList<>();
            List<DishRatingHistoryResponse> history =
                    new ArrayList<>();

            for (Meal meal : servedDishMeals) {

                List<Rating> mealRatings =
                        ratingsByMeal.getOrDefault(
                                meal.getId(),
                                List.of()
                        );

                allRatings.addAll(mealRatings);

                history.add(new DishRatingHistoryResponse(
                        meal.getId(),
                        meal.getMealDate(),
                        meal.getMealPeriod(),
                        calculateAverage(mealRatings),
                        mealRatings.size()
                ));
            }

            results.add(new DishAnalyticsResponse(
                    dish.getId(),
                    dish.getName(),
                    servedDishMeals.size(),
                    allRatings.size(),
                    calculateAverage(allRatings),
                    createDistribution(allRatings),
                    history
            ));
        }

        results.sort(
                Comparator.comparing(
                        DishAnalyticsResponse::getDishName,
                        Comparator.nullsLast(
                                String.CASE_INSENSITIVE_ORDER
                        )
                )
        );

        return results;
    }

    @Transactional(readOnly = true)
    public List<DishFeedbackResponse> getDishFeedback(Long dishId) {

        if (!dishRepository.existsById(dishId)) {
            throw new ResourceNotFoundException(
                    "Dish not found with id: " + dishId
            );
        }

        List<Meal> dishMeals = mealRepository.findAll()
                .stream()
                .filter(meal ->
                        meal.getDish() != null
                        && dishId.equals(meal.getDish().getId())
                        && isServed(meal)
                )
                .toList();

        List<Long> mealIds = dishMeals.stream()
                .map(Meal::getId)
                .toList();

        if (mealIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Meal> mealsById = dishMeals.stream()
                .collect(Collectors.toMap(
                        Meal::getId,
                        meal -> meal
                ));

        Map<Long, List<Rating>> ratingsByMeal =
                ratingRepository.findByMealIdIn(mealIds)
                        .stream()
                        .collect(Collectors.groupingBy(
                                rating -> rating.getMeal().getId()
                        ));

        Map<Long, Map<Long, Integer>> ratingValues =
                new LinkedHashMap<>();

        for (Map.Entry<Long, List<Rating>> entry :
                ratingsByMeal.entrySet()) {

            Map<Long, Integer> studentRatings =
                    new LinkedHashMap<>();

            for (Rating rating : entry.getValue()) {
                studentRatings.put(
                        rating.getStudent().getId(),
                        rating.getRatingValue()
                );
            }

            ratingValues.put(entry.getKey(), studentRatings);
        }

        List<DishFeedbackResponse> results = new ArrayList<>();

        for (Meal meal : dishMeals) {

            List<Feedback> feedbackList =
                    feedbackRepository
                            .findByMealIdOrderByCreatedAtDesc(
                                    meal.getId()
                            );

            for (Feedback feedback : feedbackList) {

                Long mealId = feedback.getMeal().getId();

                Meal sourceMeal = mealsById.get(mealId);

                Integer ratingValue = ratingValues
                        .getOrDefault(mealId, Map.of())
                        .get(feedback.getStudent().getId());

                results.add(new DishFeedbackResponse(
                        feedback.getId(),
                        mealId,
                        sourceMeal.getMealDate(),
                        sourceMeal.getMealPeriod(),
                        ratingValue,
                        feedback.getComment(),
                        feedback.getCreatedAt()
                ));
            }
        }

        results.sort(
                Comparator.comparing(
                        DishFeedbackResponse::getCreatedAt,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        return results;
    }
}
