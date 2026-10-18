
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
    @Transactional(readOnly = true)
    public List<Meal> getAllMeals() {
        List<Meal> meals = mealRepository.findAll();

        // Initialize dish associations for the API response.
        meals.forEach(meal -> {
            Dish dish = meal.getDish();

            if (dish != null) {
                dish.getId();
                dish.getImageUrl();
            }
        });

        return meals;
    }

    // READ ONE MEAL BY ID
    @Transactional(readOnly = true)
    public Meal getMealById(Long id) {
        Meal meal = mealRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Meal not found with id: " + id
                        )
                );

        Dish dish = meal.getDish();

        if (dish != null) {
            dish.getId();
            dish.getImageUrl();
        }

        return meal;
    }

    // READ TODAY'S PUBLISHED MEALS
    @Transactional(readOnly = true)
    public List<Meal> getTodaysMeals() {
        List<Meal> meals =
                mealRepository.findByMealDateAndStatus(
                        LocalDate.now(),
                        MealStatus.PUBLISHED
                );

        meals.forEach(meal -> {
            Dish dish = meal.getDish();

            if (dish != null) {
                dish.getId();
                dish.getImageUrl();
            }
        });

        return meals;
    }

    // CREATE MEAL
    @Transactional
    public Meal createMeal(Meal meal) {
        Dish dish = resolveDish(meal);

        meal.setDish(dish);

        // A new serving normally inherits its dish image.
        // Inheritance is handled by the frontend, not by
        // copying the image URL into meals.image_url.
        //
        // A nonblank meal.imageUrl is reserved for a
        // meal-specific override.
        meal.setImageUrl(
                normalizeImageUrl(meal.getImageUrl())
        );

        return mealRepository.save(meal);
    }

    // UPDATE MEAL
    @Transactional
    public Meal updateMeal(
            Long id,
            Meal updatedMeal
    ) {
        Meal existingMeal = mealRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Meal not found with id: " + id
                        )
                );

        existingMeal.setName(updatedMeal.getName());
        existingMeal.setDescription(
                updatedMeal.getDescription()
        );
        existingMeal.setMealDate(
                updatedMeal.getMealDate()
        );
        existingMeal.setMealPeriod(
                updatedMeal.getMealPeriod()
        );
        existingMeal.setStatus(
                updatedMeal.getStatus()
        );

        // Keep the current dish unless the request
        // explicitly supplies another dish.
        if (updatedMeal.getDish() != null) {
            existingMeal.setDish(
                    resolveDish(updatedMeal)
            );
        }

        // Do not copy the dish image into this meal.
        //
        // Preserve any existing meal-specific override.
        // Image changes will be handled by dedicated
        // image upload/removal endpoints in Step 2.

        return mealRepository.save(existingMeal);
    }

    // DELETE MEAL
    @Transactional
    public void deleteMeal(Long id) {
        if (!mealRepository.existsById(id)) {
            throw new IllegalArgumentException(
                    "Meal not found with id: " + id
            );
        }

        mealRepository.deleteById(id);
    }

    // RESOLVE EXISTING OR NEW DISH
    private Dish resolveDish(Meal meal) {
        if (
                meal.getDish() != null &&
                meal.getDish().getId() != null
        ) {
            Long dishId = meal.getDish().getId();

            return dishRepository.findById(dishId)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Dish not found with id: " + dishId
                            )
                    );
        }

        // No existing dish was supplied, so create one.
        Dish newDish = new Dish(
                meal.getName(),
                meal.getDescription()
        );

        // Do not copy meal.imageUrl into Dish.imageUrl.
        // Dish images are managed by the dish upload API.

        return dishRepository.save(newDish);
    }

    private String normalizeImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }

        return imageUrl.trim();
    }
}