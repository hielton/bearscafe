
package com.bearscafe.backend.repository;

import com.bearscafe.backend.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DishRepository extends JpaRepository<Dish, Long> {

    List<Dish> findByNameIgnoreCase(String name);
}
