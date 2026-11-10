
package com.bearscafe.backend.service;

import com.bearscafe.backend.entity.Meal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class NutritionMealSelectorTest {

    private NutritionMealSelector selector;
    private List<Meal> meals;

    @BeforeEach
    void setUp() {

        selector = new NutritionMealSelector();

        Meal breakfast = createMeal(
                "Scrambled Eggs",
                "BREAKFAST"
        );

        Meal pancakes = createMeal(
                "Blueberry Pancakes",
                "BREAKFAST"
        );

        Meal pizza = createMeal(
                "Cheese Pizza",
                "LUNCH"
        );

        Meal salad = createMeal(
                "Chicken Salad",
                "LUNCH"
        );

        Meal dinner = createMeal(
                "Grilled Chicken Dinner",
                "DINNER"
        );

        meals = List.of(
                breakfast,
                pancakes,
                pizza,
                salad,
                dinner
        );
    }

    private Meal createMeal(
            String name,
            String period) {

        Meal meal = new Meal();
        meal.setName(name);
        meal.setMealPeriod(period);

        return meal;
    }

    @Test
    void shouldSelectSpecificMeal() {

        var result = selector.select(
                "How many calories are in Cheese Pizza?",
                meals
        );

        assertEquals(1, result.meals().size());
        assertEquals(
                "Cheese Pizza",
                result.meals().get(0).getName()
        );
    }

    @Test
    void shouldSelectOnlyLunchMeals() {

        var result = selector.select(
                "Which lunch meal has the most protein?",
                meals
        );

        assertEquals(2, result.meals().size());

        assertTrue(
                result.meals().stream()
                        .allMatch(meal ->
                                meal.getMealPeriod()
                                        .equals("LUNCH"))
        );
    }

    @Test
    void shouldSelectOnlyBreakfastMeals() {

        var result = selector.select(
                "Which breakfast has the fewest calories?",
                meals
        );

        assertEquals(2, result.meals().size());

        assertTrue(
                result.meals().stream()
                        .allMatch(meal ->
                                meal.getMealPeriod()
                                        .equals("BREAKFAST"))
        );
    }

    @Test
    void shouldCompareAllMeals() {

        var result = selector.select(
                "Which meal has the most protein today?",
                meals
        );

        assertEquals(5, result.meals().size());
        assertTrue(result.comparison());
    }

    @Test
    void shouldSelectTwoNamedMeals() {

        var result = selector.select(
                "Compare Cheese Pizza and Chicken Salad",
                meals
        );

        assertEquals(2, result.meals().size());

        assertTrue(
                result.meals().stream()
                        .anyMatch(meal ->
                                meal.getName()
                                        .equals("Cheese Pizza"))
        );

        assertTrue(
                result.meals().stream()
                        .anyMatch(meal ->
                                meal.getName()
                                        .equals("Chicken Salad"))
        );
    }

    @Test
    void shouldReturnAllMealsWhenNoDishIsSpecified() {

        var result = selector.select(
                "How many calories are available today?",
                meals
        );

        assertEquals(5, result.meals().size());
    }
}
