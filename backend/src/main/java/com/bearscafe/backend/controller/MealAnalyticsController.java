package com.bearscafe.backend.controller;

import com.bearscafe.backend.dto.MealAnalyticsResponse;
import com.bearscafe.backend.dto.MealFeedbackResponse;
import com.bearscafe.backend.service.MealAnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics/meals")
public class MealAnalyticsController {

    private final MealAnalyticsService mealAnalyticsService;

    public MealAnalyticsController(
            MealAnalyticsService mealAnalyticsService
    ) {
        this.mealAnalyticsService = mealAnalyticsService;
    }

    // GET ANALYTICS FOR ALL MEALS
    @GetMapping
    public ResponseEntity<List<MealAnalyticsResponse>> getMealAnalytics() {
        return ResponseEntity.ok(
                mealAnalyticsService.getMealAnalytics()
        );
    }

    // GET FEEDBACK FOR A SPECIFIC MEAL
    @GetMapping("/{mealId}/feedback")
    public ResponseEntity<List<MealFeedbackResponse>> getMealFeedback(
            @PathVariable Long mealId
    ) {
        return ResponseEntity.ok(
                mealAnalyticsService.getMealFeedback(mealId)
        );
    }
}