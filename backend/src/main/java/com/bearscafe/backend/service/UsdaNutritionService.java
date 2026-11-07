
package com.bearscafe.backend.service;

import com.bearscafe.backend.dto.NutritionEstimateResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Service
public class UsdaNutritionService {

    private static final double SERVING_GRAMS = 250.0;

    private final RestClient restClient;
    private final String apiKey;

    public UsdaNutritionService(
            @Qualifier("usdaRestClient") RestClient restClient,
            @Value("${usda.api.key}") String apiKey
    ) {
        this.restClient = restClient;
        this.apiKey = apiKey;
    }

    public NutritionEstimateResponse estimate(String dishName) {
        if (dishName == null
                || dishName.isBlank()
                || dishName.trim().length() > 150) {
            throw new IllegalArgumentException(
                    "Dish name must contain 1 to 150 characters."
            );
        }

        String query = dishName.trim();

        Map<?, ?> response = fetchFoodData(query);
        return buildNutritionEstimate(query, response);
    }

    // Step 1: Communicate with USDA
    private Map<?, ?> fetchFoodData(String query) {
        Map<String, Object> request = Map.of(
                "query", query,
                "dataType", List.of("Survey (FNDDS)"),
                "pageSize", 20
        );

        try {
            Map<?, ?> response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
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

    // Step 2: Convert USDA data into a nutrition estimate
    private NutritionEstimateResponse buildNutritionEstimate(
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

        if (!(foods.get(0) instanceof Map<?, ?> food)) {
            throw new IllegalStateException(
                    "Unexpected USDA food format."
            );
        }

        String matchedFood =
                String.valueOf(food.get("description"));

        Long fdcId = toLong(food.get("fdcId"));

        Object nutrientsObject = food.get("foodNutrients");

        if (!(nutrientsObject instanceof List<?> nutrients)) {
            throw new IllegalStateException(
                    "USDA did not return nutrient information."
            );
        }

        double multiplier = SERVING_GRAMS / 100.0;

        return new NutritionEstimateResponse(
                query,
                matchedFood,
                fdcId,
                SERVING_GRAMS,
                scale(findNutrient(nutrients, 1008), multiplier),
                scale(findNutrient(nutrients, 1003), multiplier),
                scale(findNutrient(nutrients, 1005), multiplier),
                scale(findNutrient(nutrients, 1004), multiplier),
                scale(findNutrient(nutrients, 1079), multiplier),
                scale(findNutrient(nutrients, 1162), multiplier),
                scale(findNutrient(nutrients, 1087), multiplier),
                scale(findNutrient(nutrients, 1089), multiplier),
                "Estimated using a USDA comparable food and an "
                + "assumed 250 g serving. This is not verified "
                + "nutrition information for the cafeteria dish."
        );
    }

    private Double findNutrient(
            List<?> nutrients,
            int nutrientId
    ) {
        for (Object item : nutrients) {
            if (!(item instanceof Map<?, ?> nutrient)) {
                continue;
            }

            Object id = nutrient.get("nutrientId");

            if (id == null
                    && nutrient.get("nutrient") instanceof Map<?, ?> details) {
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

    private Double scale(Double value, double multiplier) {
        if (value == null) {
            return null;
        }

        return Math.round(value * multiplier * 10.0) / 10.0;
    }

    private Long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }

        throw new IllegalStateException(
                "USDA food identifier is missing."
        );
    }
}