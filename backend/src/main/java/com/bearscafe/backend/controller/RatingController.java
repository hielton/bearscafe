package com.bearscafe.backend.controller;

import com.bearscafe.backend.entity.Rating;
import com.bearscafe.backend.service.RatingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "http://localhost:5173")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping("/meal/{mealId}")
    public List<Rating> getRatingsForMeal(
            @PathVariable Long mealId) {

        return ratingService.getRatingsForMeal(mealId);
    }

    @PostMapping
    public Rating createRating(
            @RequestParam Long studentId,
            @RequestParam Long mealId,
            @RequestParam Integer ratingValue) {

        return ratingService.createRating(
                studentId,
                mealId,
                ratingValue
        );
    }
}