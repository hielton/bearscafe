
package com.bearscafe.backend.service;

import com.bearscafe.backend.dto.NutritionEstimateResponse;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UsdaNutritionService {

    private static final double FALLBACK_SERVING_GRAMS = 250.0;

    // Words that do not significantly affect food matching
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "with", "and", "of",
            "in", "on", "served", "style"
    );

    // Cooking methods that can change nutritional values
    private static final Set<String> PREPARATION_WORDS = Set.of(
            "fried", "grilled", "baked", "roasted",
            "steamed", "breaded", "smoked", "boiled"
    );

    // Ingredients and categories that may substantially change the nutritional profile of a dish
    private static final Set<String> DISH_VARIATION_WORDS = Set.of(
            "dessert", "sweet", "chocolate", "fruit",
            "fried", "breaded", "pepperoni", "sausage",
            "bacon", "cheese", "vegan", "vegetarian"
    );

    private final RestClient restClient;
    private final String apiKey;

    public UsdaNutritionService(
            @Qualifier("usdaRestClient") RestClient restClient,
            @Value("${usda.api.key}") String apiKey
    ) {
        this.restClient = restClient;
        this.apiKey = apiKey;
    }


    // Main nutrition estimation method
    public NutritionEstimateResponse estimate(String dishName) {

        if (dishName == null
                || dishName.isBlank()
                || dishName.trim().length() > 150) {

            throw new IllegalArgumentException(
                    "Dish name must contain 1 to 150 characters."
            );
        }

        String query = dishName.trim();

        // Search USDA for comparable prepared foods
        Map<?, ?> searchResponse = searchFoods(query);

        // Select the best matching USDA food
        Map<?, ?> matchedFood =
                selectBestMatch(query, searchResponse);

        Long fdcId = toLong(matchedFood.get("fdcId"));

        String matchedName =
                String.valueOf(matchedFood.get("description"));

        double servingGrams = FALLBACK_SERVING_GRAMS;
        boolean usdaPortionUsed = false;

        // Try to obtain an actual USDA serving weight
        try {

            Map<?, ?> details = fetchFoodDetails(fdcId);

            Double portionWeight = findServingWeight(details);

            if (portionWeight != null) {
                servingGrams = portionWeight;
                usdaPortionUsed = true;
            }

        } catch (RestClientException ex) {
            // Use the assumed 250 g portion if the USDA details request is unavailable.
        }

        Object nutrientsObject =
                matchedFood.get("foodNutrients");

        if (!(nutrientsObject instanceof List<?> nutrients)
                || nutrients.isEmpty()) {

            throw new IllegalStateException(
                    "USDA did not return nutrient information."
            );
        }

        double multiplier = servingGrams / 100.0;

        String portionExplanation = usdaPortionUsed
                ? "USDA-reported portion weight of "
                    + servingGrams + " g."
                : "Assumed portion weight of "
                    + servingGrams + " g.";

        return new NutritionEstimateResponse(
                query,
                matchedName,
                fdcId,
                servingGrams,

                // Calories
                scale(findNutrient(nutrients, 1008), multiplier),

                // Protein (g)
                scale(findNutrient(nutrients, 1003), multiplier),

                // Carbohydrates (g)
                scale(findNutrient(nutrients, 1005), multiplier),

                // Fat (g)
                scale(findNutrient(nutrients, 1004), multiplier),

                // Fiber (g)
                scale(findNutrient(nutrients, 1079), multiplier),

                // Vitamin C (mg)
                scale(findNutrient(nutrients, 1162), multiplier),

                // Calcium (mg)
                scale(findNutrient(nutrients, 1087), multiplier),

                // Iron (mg)
                scale(findNutrient(nutrients, 1089), multiplier),

                "Estimated using comparable USDA food: "
                    + matchedName + ". "
                    + portionExplanation
                    + " This is not verified nutrition "
                    + "information for the cafeteria dish."
        );
    }

    public NutritionEstimateResponse estimateIngredient(
            String ingredientName,
            double grams) {

        if (ingredientName == null
                || ingredientName.isBlank()
                || ingredientName.trim().length() > 150) {

            throw new IllegalArgumentException(
                    "Ingredient name must contain 1 to 150 characters.");
        }

        if (!Double.isFinite(grams)
                || grams <= 0
                || grams > 1000) {
            throw new IllegalArgumentException(
                "Ingredient weight must be between 0 and 1000 g.");
        }

        String query = ingredientName.trim();

        Map<?, ?> searchResponse = searchFoods(query);

        Map<?, ?> matchedFood =
                selectBestMatch(query, searchResponse);

        Long fdcId = toLong(matchedFood.get("fdcId"));

        String matchedName =
                String.valueOf(matchedFood.get("description"));

        Object nutrientsObject =
                matchedFood.get("foodNutrients");

        if (!(nutrientsObject instanceof List<?> nutrients)
                || nutrients.isEmpty()) {
            throw new IllegalStateException(
                    "USDA did not return nutrient information.");
        }

        double multiplier = grams / 100.0;

        return new NutritionEstimateResponse(
                query,
                matchedName,
                fdcId,
                grams,
                scale(findNutrient(nutrients, 1008), multiplier),
                scale(findNutrient(nutrients, 1003), multiplier),
                scale(findNutrient(nutrients, 1005), multiplier),
                scale(findNutrient(nutrients, 1004), multiplier),
                scale(findNutrient(nutrients, 1079), multiplier),
                scale(findNutrient(nutrients, 1162), multiplier),
                scale(findNutrient(nutrients, 1087), multiplier),
                scale(findNutrient(nutrients, 1089), multiplier),
                "Estimated from comparable USDA ingredient: "
                    + matchedName
                    + ". Assumed ingredient weight: "
                    + grams
                    + " g. Actual cafeteria portions may differ."
        );
    }

    // Search USDA FoodData Central
    private Map<?, ?> searchFoods(String query) {

        Map<String, Object> request = Map.of(
                "query", query,
                "dataType", List.of("Survey (FNDDS)"),
                "pageSize", 25
        );

        try {

            Map<?, ?> response = restClient.post()
                    .uri(builder -> builder
                            .path("/foods/search")
                            .queryParam("api_key", apiKey)
                            .build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                throw new IllegalStateException(
                        "USDA returned an empty response."
                );
            }

            return response;

        } catch (RestClientException ex) {

            throw new IllegalStateException(
                    "USDA nutrition service is unavailable.",
                    ex
            );
        }
    }

    // Fetch USDA food details
    private Map<?, ?> fetchFoodDetails(Long fdcId) {

        Map<?, ?> response = restClient.get()
                .uri(builder -> builder
                        .path("/food/{fdcId}")
                        .queryParam("api_key", apiKey)
                        .build(fdcId))
                .retrieve()
                .body(Map.class);

        return response == null ? Map.of() : response;
    }

    // Select best matching USDA food
    private Map<?, ?> selectBestMatch(
            String query,
            Map<?, ?> response
    ) {

        Object foodsObject = response.get("foods");

        if (!(foodsObject instanceof List<?> foods)
                || foods.isEmpty()) {

            throw new IllegalArgumentException(
                    "No matching food was found in USDA."
            );
        }

        Map<?, ?> bestFood = null;
        double bestScore = Double.NEGATIVE_INFINITY;

        for (Object item : foods) {

            if (!(item instanceof Map<?, ?> food)) {
                continue;
            }

            Object description = food.get("description");

            if (!(description instanceof String name)) {
                continue;
            }

            double score = matchScore(query, name);

            if (score > bestScore) {
                bestScore = score;
                bestFood = food;
            }
        }

        if (bestFood == null || bestScore < 0.65) {

            throw new IllegalArgumentException(
                    "No sufficiently similar USDA food was found."
            );
        }

        return bestFood;
    }

    // Calculate similarity between food names
    private double matchScore(
            String requested,
            String candidate
    ) {

        String normalizedRequest = normalize(requested);
        String normalizedCandidate = normalize(candidate);

        // Exact match is preferred
        if (normalizedRequest.equals(normalizedCandidate)) {
            return 1.0;
        }

        Set<String> requestedWords = words(normalizedRequest);
        Set<String> candidateWords = words(normalizedCandidate);

        if (requestedWords.isEmpty()) {
            return 0.0;
        }

        // Every meaningful word in the requested dish
        // must appear in the USDA description
        if (!candidateWords.containsAll(requestedWords)) {
            return 0.0;
        }

        // Count additional words
        long extraWords = candidateWords.stream()
                .filter(word -> !requestedWords.contains(word))
                .count();

        // Penalize additional cooking methods
        long extraPreparationWords = candidateWords.stream()
                .filter(word -> !requestedWords.contains(word))
                .filter(PREPARATION_WORDS::contains)
                .count();

        // Penalize unwanted ingredients and dish variations
        long extraVariationWords = candidateWords.stream()
                .filter(word -> !requestedWords.contains(word))
                .filter(DISH_VARIATION_WORDS::contains)
                .count();

        double score = 1.0
                - (extraWords * 0.08)
                - (extraPreparationWords * 0.15)
                - (extraVariationWords * 0.35);

        return Math.max(0.0, score);
    }

    // Normalize dish names

    private String normalize(String text) {

        return text.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private Set<String> words(String text) {

        return Arrays.stream(text.split(" "))
                .filter(word -> !word.isBlank())
                .filter(word -> !STOP_WORDS.contains(word))
                .collect(Collectors.toSet());
    }

    // Find USDA serving weight
    private Double findServingWeight(Map<?, ?> details) {

        Object portionsObject = details.get("foodPortions");

        if (!(portionsObject instanceof List<?> portions)) {
            return null;
        }

        for (Object item : portions) {

            if (!(item instanceof Map<?, ?> portion)) {
                continue;
            }

            Object modifierValue = portion.get("modifier");

            String modifier = modifierValue == null
                    ? ""
                    : modifierValue.toString()
                            .toLowerCase(Locale.ROOT);

            Object weight = portion.get("gramWeight");
            Object amount = portion.get("amount");

            // Accept only an explicitly identified serving
            if (modifier.contains("serving")
                    && weight instanceof Number grams
                    && (amount == null
                        || (amount instanceof Number number
                            && number.doubleValue() == 1.0))) {

                double value = grams.doubleValue();

                // Ignore implausible serving sizes
                if (value >= 30 && value <= 1000) {
                    return value;
                }
            }
        }

        // No reliable USDA serving weight found
        return null;
    }

    // Find nutrient by USDA nutrient ID
    private Double findNutrient(
            List<?> nutrients,
            int nutrientId
    ) {

        for (Object item : nutrients) {

            if (!(item instanceof Map<?, ?> nutrient)) {
                continue;
            }

            Object id = nutrient.get("nutrientId");

            // Some USDA responses nest nutrient metadata
            if (id == null
                    && nutrient.get("nutrient")
                            instanceof Map<?, ?> details) {

                id = details.get("id");
            }

            if (id instanceof Number number
                    && number.intValue() == nutrientId) {

                Object value = nutrient.get("value");

                if (value == null) {
                    value = nutrient.get("amount");
                }

                if (value instanceof Number amount) {
                    return amount.doubleValue();
                }
            }
        }

        return null;
    }

    // Scale nutrition to selected serving
    private Double scale(
            Double value,
            double multiplier
    ) {

        if (value == null) {
            return null;
        }

        return Math.round(
                value * multiplier * 10.0
        ) / 10.0;
    }

    // Convert USDA food identifier
    private Long toLong(Object value) {

        if (value instanceof Number number) {
            return number.longValue();
        }

        throw new IllegalStateException(
                "USDA food identifier is missing."
        );
    }
}