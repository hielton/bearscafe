
package com.bearscafe.backend.dto;

public record NutritionEstimateResponse(
        String requestedDish,
        String matchedFood,
        Long fdcId,
        double assumedServingGrams,
        Double calories,
        Double protein,
        Double carbohydrates,
        Double fat,
        Double fiber,
        Double vitaminC,
        Double calcium,
        Double iron,
        String disclaimer
) {
}