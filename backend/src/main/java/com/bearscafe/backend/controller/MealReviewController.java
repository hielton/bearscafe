package com.bearscafe.backend.controller;

import com.bearscafe.backend.dto.MealReviewRequest;
import com.bearscafe.backend.dto.MealReviewResponse;

import com.bearscafe.backend.service.MealReviewService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173")
public class MealReviewController {

    private final MealReviewService mealReviewService;

    public MealReviewController(
            MealReviewService mealReviewService
    ) {
        this.mealReviewService =
                mealReviewService;
    }

    @PostMapping("/meal/{mealId}")
    public ResponseEntity<MealReviewResponse>
    submitReview(
            @PathVariable Long mealId,
            @RequestBody MealReviewRequest request,
            Authentication authentication
    ) {

        String studentEmail =
                authentication.getName();

        MealReviewResponse response =
                mealReviewService
                        .submitReview(
                                studentEmail,
                                mealId,
                                request
                        );

        return ResponseEntity.ok(
                response
        );
    }

    @GetMapping("/meal/{mealId}/my-review")
    public ResponseEntity<MealReviewResponse>
    getMyReview(
            @PathVariable Long mealId,
            Authentication authentication
    ) {

        String studentEmail =
                authentication.getName();

        Optional<MealReviewResponse> review =
                mealReviewService
                        .getMyReview(
                                studentEmail,
                                mealId
                        );

        if (review.isEmpty()) {
            return ResponseEntity
                    .noContent()
                    .build();
        }

        return ResponseEntity.ok(
                review.get()
        );
    }
}