package com.bearscafe.backend.controller;

import com.bearscafe.backend.entity.Rating;
import com.bearscafe.backend.service.RatingService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "http://localhost:5173")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(
            RatingService ratingService
    ) {
        this.ratingService =
                ratingService;
    }

    @GetMapping("/meal/{mealId}")
    public ResponseEntity<List<Rating>>
    getRatingsForMeal(
            @PathVariable Long mealId
    ) {

        List<Rating> ratings =
                ratingService
                        .getRatingsForMeal(
                                mealId
                        );

        return ResponseEntity.ok(
                ratings
        );
    }

    @GetMapping("/meal/{mealId}/my-rating")
    public ResponseEntity<?> getMyRating(
            @PathVariable Long mealId,
            Authentication authentication
    ) {

        String studentEmail =
                authentication.getName();

        Optional<Rating> rating =
                ratingService
                        .getStudentRatingForMeal(
                                studentEmail,
                                mealId
                        );

        if (rating.isEmpty()) {
            return ResponseEntity
                    .noContent()
                    .build();
        }

        return ResponseEntity.ok(
                rating.get()
        );
    }

    @PostMapping("/meal/{mealId}")
    public ResponseEntity<Rating>
    createOrUpdateRating(
            @PathVariable Long mealId,
            @RequestParam Integer ratingValue,
            Authentication authentication
    ) {

        String studentEmail =
                authentication.getName();

        Rating rating =
                ratingService
                        .createOrUpdateRating(
                                studentEmail,
                                mealId,
                                ratingValue
                        );

        return ResponseEntity.ok(
                rating
        );
    }
}