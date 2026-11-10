
package com.bearscafe.backend.service;

import com.bearscafe.backend.dto.NutritionEstimateResponse;
import com.bearscafe.backend.entity.Meal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiChatServiceTest {

    @Mock
    private MealService mealService;

    @Mock
    private GeminiService geminiService;

    @Mock
    private NutritionMealSelector mealSelector;

    @Mock
    private MealNutritionEstimationService mealNutritionService;

    @InjectMocks
    private AiChatService aiChatService;

    private Meal chickenDinner;

    @BeforeEach
    void setUp() {
        chickenDinner = new Meal();
        chickenDinner.setName("Grilled Chicken Dinner");
        chickenDinner.setDescription(
                "Grilled chicken with rice and green beans");
        chickenDinner.setMealPeriod("DINNER");
    }

    @Test
    void shouldRejectBlankMessage() {
        assertThrows(
                IllegalArgumentException.class,
                () -> aiChatService.chat("   ")
        );

        verifyNoInteractions(
                mealService,
                geminiService,
                mealSelector,
                mealNutritionService
        );
    }

    @Test
    void shouldRejectMessageOver1000Characters() {
        assertThrows(
                IllegalArgumentException.class,
                () -> aiChatService.chat("a".repeat(1001))
        );
    }

    @Test
    void shouldAnswerMenuQuestionWithoutNutritionLookup() {

        when(mealService.getTodaysMeals())
                .thenReturn(List.of(chickenDinner));

        when(geminiService.generateResponse(anyString()))
                .thenReturn("Grilled Chicken Dinner is available.");

        String reply = aiChatService.chat(
                "What is available for dinner?"
        );

        assertEquals(
                "Grilled Chicken Dinner is available.",
                reply
        );

        verifyNoInteractions(
                mealSelector,
                mealNutritionService
        );

        verify(geminiService).generateResponse(
                contains("Grilled Chicken Dinner")
        );
    }

    @Test
    void shouldIncludeNutritionEstimateInGeminiPrompt() {

        when(mealService.getTodaysMeals())
                .thenReturn(List.of(chickenDinner));

        when(mealSelector.select(
                anyString(), anyList()))
                .thenReturn(
                        new NutritionMealSelector.Selection(
                                List.of(chickenDinner), false)
                );

        when(mealNutritionService.estimate(chickenDinner))
                .thenReturn(new NutritionEstimateResponse(
                        "Grilled Chicken Dinner",
                        "Chicken; Rice; Green beans",
                        null,
                        400,
                        478.0,
                        52.0,
                        60.0,
                        8.0,
                        5.0,
                        10.0,
                        50.0,
                        2.0,
                        "Ingredient-based estimate"
                ));

        when(geminiService.generateResponse(anyString()))
                .thenReturn("Approximately 478 calories.");

        String reply = aiChatService.chat(
                "How many calories are in the Grilled Chicken Dinner?"
        );

        assertEquals(
                "Approximately 478 calories.",
                reply
        );

        verify(mealNutritionService)
                .estimate(chickenDinner);

        verify(geminiService).generateResponse(
                argThat(prompt ->
                        prompt.contains("478.0 kcal")
                        && prompt.contains("52.0 g")
                        && prompt.contains("Chicken; Rice; Green beans")
                )
        );
    }

    @Test
    void shouldHandleUnavailableNutritionEstimate() {

        when(mealService.getTodaysMeals())
                .thenReturn(List.of(chickenDinner));

        when(mealSelector.select(
                anyString(), anyList()))
                .thenReturn(
                        new NutritionMealSelector.Selection(
                                List.of(chickenDinner), false)
                );

        when(mealNutritionService.estimate(chickenDinner))
                .thenThrow(new IllegalArgumentException(
                        "No matching food"));

        when(geminiService.generateResponse(anyString()))
                .thenReturn(
                        "Nutrition information is unavailable."
                );

        String reply = aiChatService.chat(
                "How much protein is in the Grilled Chicken Dinner?"
        );

        assertEquals(
                "Nutrition information is unavailable.",
                reply
        );

        verify(geminiService).generateResponse(
                contains("Nutrition estimate unavailable")
        );
    }

    @Test
    void shouldHandleEmptyMenu() {

        when(mealService.getTodaysMeals())
                .thenReturn(List.of());

        when(geminiService.generateResponse(anyString()))
                .thenReturn(
                        "No meals are currently published."
                );

        String reply = aiChatService.chat(
                "What is on the menu today?"
        );

        assertEquals(
                "No meals are currently published.",
                reply
        );

        verify(geminiService).generateResponse(
                contains("No meals are currently published")
        );
    }
}
