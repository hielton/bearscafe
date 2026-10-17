
package com.bearscafe.backend.service;

import com.bearscafe.backend.entity.Dish;
import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.entity.MealStatus;
import com.bearscafe.backend.repository.DishRepository;
import com.bearscafe.backend.repository.MealRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MealService {

    private final MealRepository mealRepository;
    private final DishRepository dishRepository;

    public MealService(
            MealRepository mealRepository,
            DishRepository dishRepository
    ) {
        this.mealRepository = mealRepository;
        this.dishRepository = dishRepository;
    }

    // READ ALL MEALS
    public List<Meal> getAllMeals() {
        return mealRepository.findAll();
    }

    // READ ONE MEAL BY ID
    public Meal getMealById(Long id) {
        return mealRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
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
    @Transactional
    public Meal createMeal(Meal meal) {

        Dish dish = resolveDish(meal);
        meal.setDish(dish);

        return mealRepository.save(meal);
    }

    // UPDATE MEAL
    @Transactional
    public Meal updateMeal(Long id, Meal updatedMeal) {

        Meal existingMeal = getMealById(id);

        existingMeal.setName(updatedMeal.getName());
        existingMeal.setDescription(updatedMeal.getDescription());
        existingMeal.setImageUrl(updatedMeal.getImageUrl());
        existingMeal.setMealDate(updatedMeal.getMealDate());
        existingMeal.setMealPeriod(updatedMeal.getMealPeriod());
        existingMeal.setStatus(updatedMeal.getStatus());

        // Preserve the existing dish association unless
        // the request explicitly supplies another dish.
        if (updatedMeal.getDish() != null) {
            existingMeal.setDish(resolveDish(updatedMeal));
        }

        return mealRepository.save(existingMeal);
    }

    // DELETE MEAL
    public void deleteMeal(Long id) {

        if (!mealRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Meal not found with id: " + id
            );
        }

        mealRepository.deleteById(id);
    }

    // RESOLVE DISH ASSOCIATION
    private Dish resolveDish(Meal meal) {

        if (meal.getDish() != null
                && meal.getDish().getId() != null) {

            Long dishId = meal.getDish().getId();

            return dishRepository.findById(dishId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Dish not found with id: " + dishId
                            )
                    );
        }

        Dish newDish = new Dish(
                meal.getName(),
                meal.getDescription()
        );

        return dishRepository.save(newDish);
    }
}
