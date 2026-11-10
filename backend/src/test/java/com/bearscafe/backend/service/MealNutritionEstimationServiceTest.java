
package com.bearscafe.backend.service;

import com.bearscafe.backend.dto.NutritionEstimateResponse;
import com.bearscafe.backend.entity.Meal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MealNutritionEstimationServiceTest {

    @Mock
    private UsdaNutritionService usda;

    @InjectMocks
    private MealNutritionEstimationService service;

    private Meal meal;

    @BeforeEach
    void setUp() {
        meal = new Meal();
        meal.setName("Grilled Chicken Dinner");
        meal.setDescription(
                "Grilled chicken with rice and green beans");
    }

    private NutritionEstimateResponse estimate(
            String name,
            double grams,
            double calories,
            double protein) {

        return new NutritionEstimateResponse(
                name,
                name,
                1L,
                grams,
                calories,
                protein,
                20.0,
                5.0,
                3.0,
                0.0,
                10.0,
                1.0,
                "Test estimate"
        );
    }

    @Test
    void shouldUseWholeDishWhenUsdaMatchExists() {

        NutritionEstimateResponse wholeDish =
                estimate("Grilled Chicken Dinner",
                        400, 500, 40);

        when(usda.estimate("Grilled Chicken Dinner"))
                .thenReturn(wholeDish);

        NutritionEstimateResponse result =
                service.estimate(meal);

        assertEquals(500.0, result.calories());
        assertEquals(40.0, result.protein());

        verify(usda).estimate("Grilled Chicken Dinner");
        verify(usda, never())
                .estimateIngredient(anyString(), anyDouble());
    }

    @Test
    void shouldCombineIngredientCaloriesAndProtein() {

        when(usda.estimate("Grilled Chicken Dinner"))
                .thenThrow(new IllegalArgumentException(
                        "No matching dish"));

        when(usda.estimateIngredient(
                "chicken breast grilled", 150))
                .thenReturn(estimate(
                        "Chicken", 150, 248, 46));

        when(usda.estimateIngredient(
                "rice white cooked", 150))
                .thenReturn(estimate(
                        "Rice", 150, 195, 4));

        when(usda.estimateIngredient(
                "green beans cooked", 100))
                .thenReturn(estimate(
                        "Green beans", 100, 35, 2));

        NutritionEstimateResponse result =
                service.estimate(meal);

        assertEquals(478.0, result.calories());
        assertEquals(52.0, result.protein());
        assertEquals(400.0, result.assumedServingGrams());

        verify(usda, times(3))
                .estimateIngredient(anyString(), anyDouble());
    }

    @Test
    void shouldRejectIncompleteIngredientEstimate() {

        when(usda.estimate("Grilled Chicken Dinner"))
                .thenThrow(new IllegalArgumentException(
                        "No matching dish"));

        when(usda.estimateIngredient(
                "chicken breast grilled", 150))
                .thenReturn(estimate(
                        "Chicken", 150, 248, 46));

        when(usda.estimateIngredient(
                "rice white cooked", 150))
                .thenThrow(new IllegalArgumentException(
                        "No matching rice"));

        when(usda.estimateIngredient(
                "green beans cooked", 100))
                .thenReturn(estimate(
                        "Green beans", 100, 35, 2));

        assertThrows(
                IllegalArgumentException.class,
                () -> service.estimate(meal)
        );
    }

    @Test
    void shouldRejectMealWithoutRecognizedIngredients() {

        meal.setName("Mystery Dinner");
        meal.setDescription("Chef's special creation");

        when(usda.estimate("Mystery Dinner"))
                .thenThrow(new IllegalArgumentException(
                        "No matching dish"));

        assertThrows(
                IllegalArgumentException.class,
                () -> service.estimate(meal)
        );

        verify(usda, never())
                .estimateIngredient(anyString(), anyDouble());
    }

    @Test
    void shouldReturnUnavailableForMissingNutrient() {

        when(usda.estimate("Grilled Chicken Dinner"))
                .thenThrow(new IllegalArgumentException(
                        "No matching dish"));

        when(usda.estimateIngredient(
                "chicken breast grilled", 150))
                .thenReturn(new NutritionEstimateResponse(
                        "Chicken",
                        "Chicken",
                        1L,
                        150,
                        248.0,
                        null,
                        0.0,
                        5.0,
                        0.0,
                        0.0,
                        0.0,
                        0.0,
                        "Test"
                ));

        when(usda.estimateIngredient(
                "rice white cooked", 150))
                .thenReturn(estimate(
                        "Rice", 150, 195, 4));

        when(usda.estimateIngredient(
                "green beans cooked", 100))
                .thenReturn(estimate(
                        "Green beans", 100, 35, 2));

        NutritionEstimateResponse result =
                service.estimate(meal);

        assertNull(result.protein());
        assertEquals(478.0, result.calories());
    }
}
