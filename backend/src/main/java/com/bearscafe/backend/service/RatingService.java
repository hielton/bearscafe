package com.bearscafe.backend.service;

import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.entity.Rating;
import com.bearscafe.backend.entity.User;
import com.bearscafe.backend.repository.MealRepository;
import com.bearscafe.backend.repository.RatingRepository;
import com.bearscafe.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final MealRepository mealRepository;

    public RatingService(
            RatingRepository ratingRepository,
            UserRepository userRepository,
            MealRepository mealRepository) {

        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.mealRepository = mealRepository;
    }

    public Rating createRating(
            Long studentId,
            Long mealId,
            Integer ratingValue) {

        if (ratingValue < 1 || ratingValue > 5) {
            throw new IllegalArgumentException(
                    "Rating must be between 1 and 5."
            );
        }

        if (ratingRepository.existsByStudentIdAndMealId(studentId, mealId)) {
            throw new IllegalArgumentException(
                    "Student has already rated this meal."
            );
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Student not found."));

        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Meal not found."));

        Rating rating = new Rating(ratingValue, student, meal);

        return ratingRepository.save(rating);
    }

    public List<Rating> getRatingsForMeal(Long mealId) {
        return ratingRepository.findByMealId(mealId);
    }
}