
package com.bearscafe.backend.service;

import com.bearscafe.backend.entity.Meal;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class NutritionMealSelector {

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "and", "with", "of",
            "in", "on", "served", "style"
    );

    public Selection select(
            String question,
            List<Meal> todaysMeals) {

        String normalizedQuestion = normalize(question);

        List<Meal> candidates = todaysMeals.stream()
                .filter(meal -> matchesPeriod(
                        meal, normalizedQuestion))
                .toList();

        List<Meal> namedMeals = candidates.stream()
                .filter(meal -> mentionsMeal(
                        normalizedQuestion, meal.getName()))
                .toList();

        boolean comparison = isComparison(normalizedQuestion);

        if (!namedMeals.isEmpty()) {
            if (comparison && namedMeals.size() == 1) {
                return new Selection(candidates, true);
            }

            return new Selection(
                    namedMeals,
                    comparison && namedMeals.size() > 1
            );
        }

        // Try identifying a dish using distinctive name words.
        List<Meal> partialMatches = candidates.stream()
                .filter(meal -> hasDistinctiveMatch(
                        normalizedQuestion, meal.getName()))
                .toList();

        if (partialMatches.size() == 1 && !comparison) {
            return new Selection(partialMatches, false);
        }

        return new Selection(candidates, comparison);
    }

    private boolean matchesPeriod(
            Meal meal,
            String question) {

        String requestedPeriod = null;

        if (containsWord(question, "breakfast")) {
            requestedPeriod = "BREAKFAST";
        } else if (containsWord(question, "lunch")) {
            requestedPeriod = "LUNCH";
        } else if (containsWord(question, "dinner")) {
            requestedPeriod = "DINNER";
        }

        return requestedPeriod == null ||
                (meal.getMealPeriod() != null &&
                meal.getMealPeriod()
                        .equalsIgnoreCase(requestedPeriod));
    }

    private boolean mentionsMeal(
            String question,
            String mealName) {

        String name = normalize(mealName);

        return !name.isBlank() &&
                (" " + question + " ").contains(
                        " " + name + " ");
    }

    private boolean hasDistinctiveMatch(
            String question,
            String mealName) {

        Set<String> nameWords = Arrays.stream(
                        normalize(mealName).split(" "))
                .filter(word -> word.length() >= 4)
                .filter(word -> !STOP_WORDS.contains(word))
                .collect(Collectors.toSet());

        Set<String> questionWords = Arrays.stream(
                        question.split(" "))
                .collect(Collectors.toSet());

        return nameWords.stream()
                .anyMatch(questionWords::contains);
    }

    private boolean isComparison(String question) {

        return containsWord(question, "which")
                || containsWord(question, "compare")
                || containsWord(question, "comparison")
                || containsWord(question, "most")
                || containsWord(question, "least")
                || containsWord(question, "highest")
                || containsWord(question, "lowest")
                || containsWord(question, "best")
                || containsWord(question, "healthiest")
                || containsWord(question, "healthier");
    }

    private boolean containsWord(
            String text,
            String word) {

        return (" " + text + " ").contains(
                " " + word + " ");
    }

    private String normalize(String value) {

        if (value == null) {
            return "";
        }

        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public record Selection(
            List<Meal> meals,
            boolean comparison
    ) {
    }
}
