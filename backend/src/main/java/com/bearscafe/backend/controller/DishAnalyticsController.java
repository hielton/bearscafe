
package com.bearscafe.backend.controller;

import com.bearscafe.backend.dto.DishAnalyticsResponse;
import com.bearscafe.backend.dto.DishFeedbackResponse;
import com.bearscafe.backend.service.DishAnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics/dishes")
public class DishAnalyticsController {

    private final DishAnalyticsService dishAnalyticsService;

    public DishAnalyticsController(
            DishAnalyticsService dishAnalyticsService
    ) {
        this.dishAnalyticsService = dishAnalyticsService;
    }

    // GET HISTORICAL ANALYTICS FOR ALL DISHES
    @GetMapping
    public ResponseEntity<List<DishAnalyticsResponse>> getDishAnalytics() {
        return ResponseEntity.ok(
                dishAnalyticsService.getDishAnalytics()
        );
    }

    // GET FEEDBACK ACROSS ALL SERVINGS OF A DISH
    @GetMapping("/{dishId}/feedback")
    public ResponseEntity<List<DishFeedbackResponse>> getDishFeedback(
            @PathVariable Long dishId
    ) {
        return ResponseEntity.ok(
                dishAnalyticsService.getDishFeedback(dishId)
        );
    }
}
