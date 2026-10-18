
package com.bearscafe.backend.controller;

import com.bearscafe.backend.entity.Dish;
import com.bearscafe.backend.service.DishImageService;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/dishes")
public class DishImageController {

    private final DishImageService dishImageService;

    public DishImageController(DishImageService dishImageService) {
        this.dishImageService = dishImageService;
    }

    @PostMapping(
            value = "/{dishId}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, Object>> uploadImage(
            @PathVariable Long dishId,
            @RequestParam("file") MultipartFile file
    ) {
        Dish dish = dishImageService.uploadImage(dishId, file);

        return ResponseEntity.ok(Map.of(
                "dishId", dish.getId(),
                "imageUrl", dish.getImageUrl()
        ));
    }

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(
            @PathVariable String filename
    ) {
        Path path = dishImageService.getImagePath(filename);

        String contentType;

        if (filename.endsWith(".png")) {
            contentType = MediaType.IMAGE_PNG_VALUE;
        } else if (filename.endsWith(".webp")) {
            contentType = "image/webp";
        } else {
            contentType = MediaType.IMAGE_JPEG_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(new FileSystemResource(path));
    }
}
