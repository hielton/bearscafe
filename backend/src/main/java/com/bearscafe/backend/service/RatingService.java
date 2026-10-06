package com.bearscafe.backend.service;

import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.entity.Rating;
import com.bearscafe.backend.entity.Role;
import com.bearscafe.backend.entity.User;

import com.bearscafe.backend.repository.MealRepository;
import com.bearscafe.backend.repository.RatingRepository;
import com.bearscafe.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final MealRepository mealRepository;

    public RatingService(
            RatingRepository ratingRepository,
            UserRepository userRepository,
            MealRepository mealRepository
    ) {
        this.ratingRepository =
                ratingRepository;

        this.userRepository =
                userRepository;

        this.mealRepository =
                mealRepository;
    }

    public Rating createOrUpdateRating(
            String studentEmail,
            Long mealId,
            Integer ratingValue
    ) {

        if (
                ratingValue == null ||
                ratingValue < 1 ||
                ratingValue > 5
        ) {
            throw new IllegalArgumentException(
                    "Rating must be between 1 and 5."
            );
        }

        User student =
                userRepository
                        .findByEmail(studentEmail)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Student not found."
                                )
                        );

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException(
                    "Only students can submit ratings."
            );
        }

        Meal meal =
                mealRepository
                        .findById(mealId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Meal not found."
                                )
                        );

        Optional<Rating> existingRating =
                ratingRepository
                        .findByStudentIdAndMealId(
                                student.getId(),
                                mealId
                        );

        if (existingRating.isPresent()) {

            Rating rating =
                    existingRating.get();

            rating.setRatingValue(
                    ratingValue
            );

            return ratingRepository.save(
                    rating
            );
        }

        Rating newRating =
                new Rating(
                        ratingValue,
                        student,
                        meal
                );

        return ratingRepository.save(
                newRating
        );
    }

    public List<Rating> getRatingsForMeal(
            Long mealId
    ) {
        return ratingRepository
                .findByMealId(mealId);
    }

    public Optional<Rating> getStudentRatingForMeal(
            String studentEmail,
            Long mealId
    ) {

        User student =
                userRepository
                        .findByEmail(studentEmail)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Student not found."
                                )
                        );

        return ratingRepository
                .findByStudentIdAndMealId(
                        student.getId(),
                        mealId
                );
    }
}