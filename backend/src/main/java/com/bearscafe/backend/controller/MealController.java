package com.bearscafe.backend.controller;

import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.service.MealService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "http://localhost:5173")
public class MealController {

    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    // GET all meals
    @GetMapping
    public List<Meal> getAllMeals() {
        return mealService.getAllMeals();
    }

    // GET today's published meals
    @GetMapping("/today")
    public List<Meal> getTodaysMeals() {
        return mealService.getTodaysMeals();
    }

    // GET one meal by ID
    @GetMapping("/{id}")
    public ResponseEntity<Meal> getMealById(@PathVariable Long id) {
        Meal meal = mealService.getMealById(id);
        return ResponseEntity.ok(meal);
    }

    // CREATE a new meal
    @PostMapping
    public ResponseEntity<Meal> createMeal(@RequestBody Meal meal) {
        Meal createdMeal = mealService.createMeal(meal);
        return ResponseEntity.ok(createdMeal);
    }

    // UPDATE a meal
    @PutMapping("/{id}")
    public ResponseEntity<Meal> updateMeal(
            @PathVariable Long id,
            @RequestBody Meal meal) {

        Meal updatedMeal = mealService.updateMeal(id, meal);
        return ResponseEntity.ok(updatedMeal);
    }

    // DELETE a meal
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Long id) {
        mealService.deleteMeal(id);
        return ResponseEntity.noContent().build();
    }
}