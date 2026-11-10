
package com.bearscafe.backend.controller;

import com.bearscafe.backend.dto.AiChatRequest;
import com.bearscafe.backend.dto.AiChatResponse;
import com.bearscafe.backend.service.AiChatService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(
            @RequestBody AiChatRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "A message is required.");
        }

        String reply = aiChatService.chat(
                request.message());

        return ResponseEntity.ok(
                new AiChatResponse(reply));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(
            IllegalArgumentException ex) {

        return ResponseEntity.badRequest()
                .body(ex.getMessage());
    }
}
