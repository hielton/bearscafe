
package com.bearscafe.backend.service;

import com.bearscafe.backend.dto.NutritionEstimateResponse;
import com.bearscafe.backend.entity.Meal;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class MealNutritionEstimationService {

    private final UsdaNutritionService usda;

    public MealNutritionEstimationService(
            UsdaNutritionService usda) {
        this.usda = usda;
    }

    private record IngredientRule(
            String keyword,
            String usdaQuery,
            double grams
    ) {}

    private static final List<IngredientRule> RULES = List.of(
            new IngredientRule(
                    "chicken", "chicken breast grilled", 150),
            new IngredientRule(
                    "rice", "rice white cooked", 150),
            new IngredientRule(
                    "green beans", "green beans cooked", 100),
            new IngredientRule(
                    "broccoli", "broccoli cooked", 100),
            new IngredientRule(
                    "potatoes", "potatoes boiled", 150),
            new IngredientRule(
                    "salmon", "salmon baked", 150),
            new IngredientRule(
                    "pasta", "pasta cooked", 180)
    );

    public NutritionEstimateResponse estimate(Meal meal) {

        // First try a complete-dish match.
        try {
            return usda.estimate(meal.getName());
        } catch (IllegalArgumentException ex) {
            // No sufficiently similar complete dish:
            // fall back to individual ingredients.
        }

        String description = meal.getDescription() == null
                ? ""
                : meal.getDescription();

        String text = (" " + meal.getName()
                + " " + description + " ")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ");

        List<NutritionEstimateResponse> results =
                new ArrayList<>();

        List<String> missing = new ArrayList<>();

        for (IngredientRule rule : RULES) {

            if (!text.contains(" " + rule.keyword() + " ")) {
                continue;
            }

            try {
                results.add(
                        usda.estimateIngredient(
                                rule.usdaQuery(),
                                rule.grams()
                        )
                );
            } catch (IllegalArgumentException |
                     IllegalStateException ex) {
                missing.add(rule.keyword());
            }
        }

        if (results.isEmpty()) {
            throw new IllegalArgumentException(
                    "No ingredient nutrition estimates available.");
        }

        // Do not present a partial meal as a total.
        if (!missing.isEmpty()) {
            throw new IllegalArgumentException(
                    "Some identified ingredients could not "
                    + "be estimated: " + missing);
        }

        double grams = results.stream()
                .mapToDouble(
                        NutritionEstimateResponse::assumedServingGrams)
                .sum();

        String matchedFoods = results.stream()
                .map(NutritionEstimateResponse::matchedFood)
                .reduce((a, b) -> a + "; " + b)
                .orElse("");

        return new NutritionEstimateResponse(
                meal.getName(),
                matchedFoods,
                null,
                grams,
                sum(results, 0),
                sum(results, 1),
                sum(results, 2),
                sum(results, 3),
                sum(results, 4),
                sum(results, 5),
                sum(results, 6),
                sum(results, 7),
                "Ingredient-based estimate using assumed "
                + "portions. Only recognized ingredients "
                + "were included. Unlisted ingredients, "
                + "oils, sauces and actual portion sizes "
                + "may change the nutrition substantially."
        );
    }

    private Double sum(
            List<NutritionEstimateResponse> results,
            int nutrient) {

        double total = 0;

        for (NutritionEstimateResponse r : results) {
            Double value = switch (nutrient) {
                case 0 -> r.calories();
                case 1 -> r.protein();
                case 2 -> r.carbohydrates();
                case 3 -> r.fat();
                case 4 -> r.fiber();
                case 5 -> r.vitaminC();
                case 6 -> r.calcium();
                case 7 -> r.iron();
                default -> null;
            };

            // Missing nutrient data must not be
            // silently interpreted as zero.
            if (value == null) {
                return null;
            }

            total += value;
        }

        return Math.round(total * 10.0) / 10.0;
    }
}