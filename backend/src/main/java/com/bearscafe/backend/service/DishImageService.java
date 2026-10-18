
package com.bearscafe.backend.service;

import com.bearscafe.backend.entity.Dish;
import com.bearscafe.backend.repository.DishRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class DishImageService {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    private final DishRepository dishRepository;
    private final Path uploadDirectory;

    public DishImageService(
            DishRepository dishRepository,
            @Value("${app.upload.dir:uploads/dishes}") String uploadDir
    ) {
        this.dishRepository = dishRepository;
        this.uploadDirectory = Path.of(uploadDir)
                .toAbsolutePath()
                .normalize();
    }

    @Transactional
    public Dish uploadImage(Long dishId, MultipartFile file) {

        Dish dish = dishRepository.findById(dishId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Dish not found: " + dishId
                ));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select an image."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Image must be 5 MB or smaller."
            );
        }

        String contentType = file.getContentType();
        String extension = ALLOWED_TYPES.get(contentType);

        if (extension == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPG, PNG, and WebP images are allowed."
            );
        }

        String filename = UUID.randomUUID() + "." + extension;
        Path destination = uploadDirectory.resolve(filename).normalize();

        if (!destination.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file path."
            );
        }

        try {
            Files.createDirectories(uploadDirectory);

            // Verify file signatures, not just the browser-provided MIME type.
            try (InputStream input = file.getInputStream()) {
                byte[] header = input.readNBytes(12);

                if (!matchesSignature(header, contentType)) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "The file content does not match its image type."
                    );
                }
            }

            try (InputStream input = file.getInputStream()) {
                Files.copy(
                        input,
                        destination,
                        StandardCopyOption.REPLACE_EXISTING
                );
            }

            dish.setImageUrl("/api/dishes/images/" + filename);
            return dishRepository.save(dish);

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save image.",
                    exception
            );
        }
    }

    private boolean matchesSignature(byte[] bytes, String type) {

        if ("image/jpeg".equals(type)) {
            return bytes.length >= 3
                    && (bytes[0] & 0xFF) == 0xFF
                    && (bytes[1] & 0xFF) == 0xD8
                    && (bytes[2] & 0xFF) == 0xFF;
        }

        if ("image/png".equals(type)) {
            int[] signature = {137, 80, 78, 71, 13, 10, 26, 10};

            if (bytes.length < signature.length) {
                return false;
            }

            for (int i = 0; i < signature.length; i++) {
                if ((bytes[i] & 0xFF) != signature[i]) {
                    return false;
                }
            }

            return true;
        }

        if ("image/webp".equals(type)) {
            return bytes.length >= 12
                    && new String(bytes, 0, 4,
                            java.nio.charset.StandardCharsets.US_ASCII)
                            .equals("RIFF")
                    && new String(bytes, 8, 4,
                            java.nio.charset.StandardCharsets.US_ASCII)
                            .equals("WEBP");
        }

        return false;
    }

    public Path getImagePath(String filename) {

        if (!filename.matches("[a-fA-F0-9-]{36}\\.(jpg|png|webp)")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid image filename."
            );
        }

        Path imagePath = uploadDirectory.resolve(filename).normalize();

        if (!imagePath.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid image path."
            );
        }

        if (!Files.isRegularFile(imagePath)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Image not found."
            );
        }

        return imagePath;
    }
}
