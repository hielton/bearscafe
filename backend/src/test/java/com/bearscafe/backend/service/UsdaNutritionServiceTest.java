
package com.bearscafe.backend.service;

import com.bearscafe.backend.dto.NutritionEstimateResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class UsdaNutritionServiceTest {

    private UsdaNutritionService nutritionService;
    private MockRestServiceServer mockServer;

    private static final String API_KEY = "test-api-key";

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl("https://api.nal.usda.gov/fdc/v1");

        mockServer = MockRestServiceServer.bindTo(builder).build();

        nutritionService = new UsdaNutritionService(
                builder.build(),
                API_KEY
        );
    }

    // TEST 1: Correct nutrition calculations
    @Test
    void estimate_shouldCalculateNutritionFor250GramServing() {

        String usdaResponse = """
            {
              "foods": [
                {
                  "fdcId": 12345,
                  "description": "Chicken sandwich",
                  "foodNutrients": [
                    {"nutrientId": 1008, "value": 200.0},
                    {"nutrientId": 1003, "value": 12.0},
                    {"nutrientId": 1005, "value": 20.0},
                    {"nutrientId": 1004, "value": 8.0},
                    {"nutrientId": 1079, "value": 2.0},
                    {"nutrientId": 1162, "value": 4.0},
                    {"nutrientId": 1087, "value": 40.0},
                    {"nutrientId": 1089, "value": 1.0}
                  ]
                }
              ]
            }
            """;

        mockServer.expect(requestTo(
                "https://api.nal.usda.gov/fdc/v1/foods/search"
                + "?api_key=" + API_KEY
        ))
        .andExpect(method(HttpMethod.POST))
        .andExpect(content().contentTypeCompatibleWith(
                MediaType.APPLICATION_JSON
        ))
        .andExpect(jsonPath("$.query").value("Chicken Sandwich"))
        .andRespond(withSuccess(
                usdaResponse,
                MediaType.APPLICATION_JSON
        ));

        mockServer.expect(requestTo(
                "https://api.nal.usda.gov/fdc/v1/food/12345"
                + "?api_key=" + API_KEY
        ))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(
                "{\"foodPortions\": []}",
                MediaType.APPLICATION_JSON
        ));

        NutritionEstimateResponse result =
                nutritionService.estimate("Chicken Sandwich");

        assertEquals("Chicken Sandwich", result.requestedDish());
        assertEquals("Chicken sandwich", result.matchedFood());
        assertEquals(12345L, result.fdcId());
        assertEquals(250.0, result.assumedServingGrams());

        assertEquals(500.0, result.calories());
        assertEquals(30.0, result.protein());
        assertEquals(50.0, result.carbohydrates());
        assertEquals(20.0, result.fat());
        assertEquals(5.0, result.fiber());
        assertEquals(10.0, result.vitaminC());
        assertEquals(100.0, result.calcium());
        assertEquals(2.5, result.iron());

        mockServer.verify();
    }

    // TEST 2: Missing nutrient data
    @Test
    void estimate_shouldReturnNullForMissingNutrients() {

        String usdaResponse = """
            {
              "foods": [
                {
                  "fdcId": 67890,
                  "description": "Plain rice",
                  "foodNutrients": [
                    {"nutrientId": 1008, "value": 130.0},
                    {"nutrientId": 1003, "value": 2.7}
                  ]
                }
              ]
            }
            """;

        mockServer.expect(requestTo(
                "https://api.nal.usda.gov/fdc/v1/foods/search"
                + "?api_key=" + API_KEY
        ))
        .andRespond(withSuccess(
                usdaResponse,
                MediaType.APPLICATION_JSON
        ));

        mockServer.expect(requestTo(
                "https://api.nal.usda.gov/fdc/v1/food/67890"
                + "?api_key=" + API_KEY
        ))
        .andExpect(method(HttpMethod.GET))
        .andRespond(withSuccess(
                "{\"foodPortions\": []}",
                MediaType.APPLICATION_JSON
        ));

        NutritionEstimateResponse result =
                nutritionService.estimate("Rice");

        assertEquals(325.0, result.calories());
        assertEquals(6.8, result.protein());

        assertNull(result.carbohydrates());
        assertNull(result.fat());
        assertNull(result.fiber());
        assertNull(result.vitaminC());
        assertNull(result.calcium());
        assertNull(result.iron());

        mockServer.verify();
    }

    // TEST 3: Invalid dish names
    @Test
    void estimate_shouldRejectInvalidDishNames() {

        assertThrows(
                IllegalArgumentException.class,
                () -> nutritionService.estimate("")
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> nutritionService.estimate("   ")
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> nutritionService.estimate(null)
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> nutritionService.estimate("A".repeat(151))
        );

        // No external HTTP requests should have occurred.
        mockServer.verify();
    }

    // TEST 4: USDA API failure
    @Test
    void estimate_shouldHandleUsdaApiFailure() {

        mockServer.expect(requestTo(
                "https://api.nal.usda.gov/fdc/v1/foods/search"
                + "?api_key=" + API_KEY
        ))
        .andRespond(withStatus(
                HttpStatus.SERVICE_UNAVAILABLE
        ));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> nutritionService.estimate("Lasagna")
        );

        assertEquals(
                "USDA nutrition service is unavailable.",
                exception.getMessage()
        );

        assertNotNull(exception.getCause());

        mockServer.verify();
    }

    // TEST 5: better match instead of the first result
    @Test
    void estimate_shouldSelectBestMatchingDish() {

        String response = """
                {
                "foods": [
                {
                "fdcId": 111,
                "description": "Chicken sandwich, fried, with cheese",
                "foodNutrients": [
                        {"nutrientId": 1008, "value": 300.0}
                ]
                },
                {
                "fdcId": 222,
                "description": "Chicken sandwich",
                "foodNutrients": [
                        {"nutrientId": 1008, "value": 200.0}
                ]
                }
                ]
                }
                """;

        mockServer.expect(requestTo(
                "https://api.nal.usda.gov/fdc/v1/foods/search"
                + "?api_key=" + API_KEY
        ))
        .andRespond(withSuccess(
                response, MediaType.APPLICATION_JSON
        ));

        mockServer.expect(requestTo(
                "https://api.nal.usda.gov/fdc/v1/food/222"
                + "?api_key=" + API_KEY
        ))
        .andRespond(withSuccess(
                "{\"foodPortions\": []}",
                MediaType.APPLICATION_JSON
        ));

        NutritionEstimateResponse result =
                nutritionService.estimate("Chicken Sandwich");

        assertEquals("Chicken sandwich", result.matchedFood());
        assertEquals(222L, result.fdcId());
        assertEquals(500.0, result.calories());

        mockServer.verify();
    }

    //  TEST 6: USDA serving weight when available
    @Test
    void estimate_shouldUseUsdaServingWeight() {

        String searchResponse = """
        {
          "foods": [
            {
              "fdcId": 333,
              "description": "Lasagna",
              "foodNutrients": [
                {"nutrientId": 1008, "value": 160.0},
                {"nutrientId": 1003, "value": 10.0}
              ]
            }
          ]
        }
        """;

        String detailResponse = """
        {
          "foodPortions": [
            {
              "modifier": "1 serving",
              "amount": 1.0,
              "gramWeight": 300.0
            }
          ]
        }
        """;

        mockServer.expect(requestTo(
            "https://api.nal.usda.gov/fdc/v1/foods/search"
            + "?api_key=" + API_KEY
        ))
        .andRespond(withSuccess(
            searchResponse, MediaType.APPLICATION_JSON
        ));

        mockServer.expect(requestTo(
            "https://api.nal.usda.gov/fdc/v1/food/333"
            + "?api_key=" + API_KEY
        ))
        .andRespond(withSuccess(
            detailResponse, MediaType.APPLICATION_JSON
        ));

        NutritionEstimateResponse result =
            nutritionService.estimate("Lasagna");

        assertEquals(300.0, result.assumedServingGrams());
        assertEquals(480.0, result.calories());
        assertEquals(30.0, result.protein());
        assertTrue(result.disclaimer().contains("USDA-reported"));

        mockServer.verify();
    }

    // TEST 7: reject unrelated USDA results
    @Test
    void estimate_shouldRejectUnrelatedFood() {

        String response = """
        {
          "foods": [
            {
              "fdcId": 444,
              "description": "Chocolate cake",
              "foodNutrients": [
                {"nutrientId": 1008, "value": 350.0}
              ]
            }
          ]
        }
        """;

        mockServer.expect(requestTo(
            "https://api.nal.usda.gov/fdc/v1/foods/search"
            + "?api_key=" + API_KEY
        ))
        .andRespond(withSuccess(
                response, MediaType.APPLICATION_JSON
        ));

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> nutritionService.estimate("Chicken Sandwich")
        );

        assertEquals(
            "No sufficiently similar USDA food was found.",
            exception.getMessage()
        );

        mockServer.verify();
    }

    // TEST 8: Regression test for score
    @Test
    void estimate_shouldRejectDessertPizzaForPlainPizza() {

        String response = """
        {
          "foods": [
            {
              "fdcId": 2708008,
              "description": "Dessert pizza",
              "foodNutrients": [
                {"nutrientId": 1008, "value": 204.0}
              ]
            }
          ]
        }
        """;

        mockServer.expect(requestTo(
            "https://api.nal.usda.gov/fdc/v1/foods/search"
            + "?api_key=" + API_KEY
        ))
        .andRespond(withSuccess(
            response, MediaType.APPLICATION_JSON
        ));

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> nutritionService.estimate("Pizza")
        );

        assertEquals(
            "No sufficiently similar USDA food was found.",
            exception.getMessage()
        );

        mockServer.verify();
    }

}