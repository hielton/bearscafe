package com.bearscafe.backend.repository;

import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.entity.MealStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MealRepository extends JpaRepository<Meal, Long> {

    List<Meal> findByMealDate(LocalDate mealDate);

    List<Meal> findByMealDateAndStatus(
            LocalDate mealDate,
            MealStatus status
    );
}