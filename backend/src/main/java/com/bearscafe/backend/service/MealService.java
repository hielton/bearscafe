package com.bearscafe.backend.service;

import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.entity.MealStatus;
import com.bearscafe.backend.repository.MealRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MealService {

    private final MealRepository mealRepository;

    public MealService(MealRepository mealRepository) {
        this.mealRepository = mealRepository;
    }

    // READ ALL MEALS
    public List<Meal> getAllMeals() {
        return mealRepository.findAll();
    }

    // READ ONE MEAL BY ID
    public Meal getMealById(Long id) {
        return mealRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Meal not found with id: " + id
                        )
                );
    }

    // READ TODAY'S PUBLISHED MEALS
    public List<Meal> getTodaysMeals() {
        return mealRepository.findByMealDateAndStatus(
                LocalDate.now(),
                MealStatus.PUBLISHED
        );
    }

    // CREATE MEAL
    public Meal createMeal(Meal meal) {
        return mealRepository.save(meal);
    }

    // UPDATE MEAL
    public Meal updateMeal(Long id, Meal updatedMeal) {

        Meal existingMeal = getMealById(id);

        existingMeal.setName(updatedMeal.getName());
        existingMeal.setDescription(updatedMeal.getDescription());
        existingMeal.setImageUrl(updatedMeal.getImageUrl());
        existingMeal.setMealDate(updatedMeal.getMealDate());
        existingMeal.setMealPeriod(updatedMeal.getMealPeriod());
        existingMeal.setStatus(updatedMeal.getStatus());

        return mealRepository.save(existingMeal);
    }

    // DELETE MEAL
        public void deleteMeal(Long id) {

        if (!mealRepository.existsById(id)) {
            throw new RuntimeException(
                    "Meal not found with id: " + id
            );
        }

        mealRepository.deleteById(id);
    }
}