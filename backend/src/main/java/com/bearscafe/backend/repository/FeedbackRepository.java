
package com.bearscafe.backend.repository;

import com.bearscafe.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository
        extends JpaRepository<Feedback, Long> {

    List<Feedback> findByMealId(Long mealId);

    Optional<Feedback> findByStudentIdAndMealId(
            Long studentId,
            Long mealId
    );

    boolean existsByStudentIdAndMealId(
            Long studentId,
            Long mealId
    );

    List<Feedback> findByMealIdOrderByCreatedAtDesc(
            Long mealId
    );
}
