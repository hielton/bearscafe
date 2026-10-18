
package com.bearscafe.backend.service;

import com.bearscafe.backend.entity.Meal;
import com.bearscafe.backend.repository.MealRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class MealImageService {

    private final MealRepository mealRepository;
    private final Path uploadDirectory;

    public MealImageService(
            MealRepository mealRepository,
            @Value("${bearscafe.upload-dir:uploads/dishes}")
            String uploadDir
    ) {
        this.mealRepository = mealRepository;
        this.uploadDirectory =
                Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public Meal uploadMealImage(
            Long mealId,
            MultipartFile file
    ) throws IOException {

        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Meal not found with id: " + mealId
                        )
                );

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select an image to upload."
            );
        }

        if (file.getSize() > 5L * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Image must be 5 MB or smaller."
            );
        }

        String contentType = file.getContentType();

        String extension;

        if ("image/jpeg".equalsIgnoreCase(contentType)) {
            extension = ".jpg";
        } else if ("image/png".equalsIgnoreCase(contentType)) {
            extension = ".png";
        } else if ("image/webp".equalsIgnoreCase(contentType)) {
            extension = ".webp";
        } else {
            throw new IllegalArgumentException(
                    "Only JPG, PNG, and WebP images are supported."
            );
        }

        Files.createDirectories(uploadDirectory);

        String filename =
                UUID.randomUUID().toString() + extension;

        Path destination =
                uploadDirectory.resolve(filename).normalize();

        if (!destination.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException(
                    "Invalid image path."
            );
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(
                    inputStream,
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );
        }

        // The existing DishImageController serves
        // GET /api/dishes/images/{filename}.
        String imageUrl =
                "/api/dishes/images/" + filename;

        meal.setImageUrl(imageUrl);

        return mealRepository.save(meal);
    }

    @Transactional
    public Meal removeMealImage(Long mealId) {

        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Meal not found with id: " + mealId
                        )
                );

        // Remove the override, not the dish image.
        meal.setImageUrl(null);

        return mealRepository.save(meal);
    }
}
