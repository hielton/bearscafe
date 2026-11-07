
package com.bearscafe.backend.controller;

import com.bearscafe.backend.dto.NutritionEstimateResponse;
import com.bearscafe.backend.service.UsdaNutritionService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    private final UsdaNutritionService nutritionService;

    public NutritionController(
            UsdaNutritionService nutritionService
    ) {
        this.nutritionService = nutritionService;
    }

    @GetMapping("/estimate")
    public ResponseEntity<?> estimate(
            @RequestParam String dishName
    ) {
        try {
            NutritionEstimateResponse result =
                    nutritionService.estimate(dishName);

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message", ex.getMessage()
                    ));

        } catch (IllegalStateException ex) {

            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "message",
                            "Unable to retrieve nutrition data "
                            + "from USDA at this time."
                    ));
        }
    }
}