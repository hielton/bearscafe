
package com.bearscafe.backend.service;

import tools.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GeminiService(
            @Qualifier("geminiRestClient") RestClient restClient,
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.api.model}") String model) {

        this.restClient = restClient;
        this.apiKey = apiKey;
        this.model = model;
    }

    public String generateResponse(String message) {

        if (message == null || message.isBlank()
                || message.length() > 30000) {
            throw new IllegalArgumentException(
                    "Message must contain 1 to 30000 characters.");
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", message)
                                )
                        )
                )
        );

        JsonNode response = restClient.post()
                .uri("/models/{model}:generateContent", model)
                .header("x-goog-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

        JsonNode textNode = response == null
                ? null
                : response.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

        if (textNode == null || !textNode.isTextual()) {
            throw new IllegalStateException(
                    "Gemini did not return a text response.");
        }

        return textNode.asText();
    }
}