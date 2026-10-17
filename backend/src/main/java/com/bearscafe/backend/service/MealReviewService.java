
package com.bearscafe.backend.service;

import com.bearscafe.backend.dto.MealReviewRequest;
import com.bearscafe.backend.dto.MealReviewResponse;

import com.bearscafe.backend.entity.Feedback;
import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.entity.Rating;
import com.bearscafe.backend.entity.Role;
import com.bearscafe.backend.entity.User;

import com.bearscafe.backend.exception.ResourceNotFoundException;

import com.bearscafe.backend.repository.FeedbackRepository;
import com.bearscafe.backend.repository.MealRepository;
import com.bearscafe.backend.repository.RatingRepository;
import com.bearscafe.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class MealReviewService {

    private final RatingRepository ratingRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final MealRepository mealRepository;

    public MealReviewService(
            RatingRepository ratingRepository,
            FeedbackRepository feedbackRepository,
            UserRepository userRepository,
            MealRepository mealRepository
    ) {
        this.ratingRepository = ratingRepository;
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.mealRepository = mealRepository;
    }

    @Transactional
    public MealReviewResponse submitReview(
            String studentEmail,
            Long mealId,
            MealReviewRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Review information is required."
            );
        }

        Integer ratingValue = request.getRatingValue();

        String comment = request.getComment() == null
                ? ""
                : request.getComment().trim();

        if (ratingValue == null || ratingValue < 1 || ratingValue > 5) {
            throw new IllegalArgumentException(
                    "Rating must be between 1 and 5."
            );
        }

        if (comment.length() > 2000) {
            throw new IllegalArgumentException(
                    "Feedback cannot exceed 2000 characters."
            );
        }

        if (ratingValue <= 2 && comment.isBlank()) {
            throw new IllegalArgumentException(
                    "Written feedback is required for ratings of 1 or 2 stars."
            );
        }

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found."
                ));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException(
                    "Only students can submit meal reviews."
            );
        }

        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Meal not found."
                ));

        Optional<Rating> existingRating =
                ratingRepository.findByStudentIdAndMealId(
                        student.getId(),
                        mealId
                );

        Rating rating;

        if (existingRating.isPresent()) {
            rating = existingRating.get();
            rating.setRatingValue(ratingValue);
        } else {
            rating = new Rating(
                    ratingValue,
                    student,
                    meal
            );
        }

        ratingRepository.save(rating);

        Optional<Feedback> existingFeedback =
                feedbackRepository.findByStudentIdAndMealId(
                        student.getId(),
                        mealId
                );

        if (comment.isBlank()) {
            existingFeedback.ifPresent(feedbackRepository::delete);
        } else if (existingFeedback.isPresent()) {
            Feedback feedback = existingFeedback.get();
            feedback.setComment(comment);
            feedbackRepository.save(feedback);
        } else {
            Feedback feedback = new Feedback(
                    comment,
                    student,
                    meal
            );
            feedbackRepository.save(feedback);
        }

        return new MealReviewResponse(
                mealId,
                ratingValue,
                comment.isBlank() ? null : comment,
                "Review saved successfully."
        );
    }

    @Transactional(readOnly = true)
    public Optional<MealReviewResponse> getMyReview(
            String studentEmail,
            Long mealId
    ) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Student not found."
                ));

        if (!mealRepository.existsById(mealId)) {
            throw new ResourceNotFoundException(
                    "Meal not found."
            );
        }

        Optional<Rating> rating =
                ratingRepository.findByStudentIdAndMealId(
                        student.getId(),
                        mealId
                );

        if (rating.isEmpty()) {
            return Optional.empty();
        }

        Optional<Feedback> feedback =
                feedbackRepository.findByStudentIdAndMealId(
                        student.getId(),
                        mealId
                );

        String comment = feedback
                .map(Feedback::getComment)
                .orElse(null);

        return Optional.of(
                new MealReviewResponse(
                        mealId,
                        rating.get().getRatingValue(),
                        comment,
                        "Review found."
                )
        );
    }
}
