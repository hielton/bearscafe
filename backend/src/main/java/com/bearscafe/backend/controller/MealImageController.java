
package com.bearscafe.backend.controller;

import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.service.MealImageService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/meals")
public class MealImageController {

    private final MealImageService mealImageService;

    public MealImageController(
            MealImageService mealImageService
    ) {
        this.mealImageService = mealImageService;
    }

    // Upload or replace the picture for ONE meal.
    @PostMapping(
            value = "/{mealId}/image",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> uploadMealImage(
            @PathVariable Long mealId,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        Meal meal = mealImageService.uploadMealImage(
                mealId,
                file
        );

        return ResponseEntity.ok(
                Map.of(
                        "mealId", meal.getId(),
                        "imageUrl", meal.getImageUrl(),
                        "message", "Meal image uploaded successfully."
                )
        );
    }

    // Remove an override and return to the dish picture.
    @DeleteMapping("/{mealId}/image")
    public ResponseEntity<?> removeMealImage(
            @PathVariable Long mealId
    ) {
        Meal meal =
                mealImageService.removeMealImage(mealId);

        return ResponseEntity.ok(
                Map.of(
                        "mealId", meal.getId(),
                        "message", "Meal image override removed."
                )
        );
    }
}