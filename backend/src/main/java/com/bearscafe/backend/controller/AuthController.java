package com.bearscafe.backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @GetMapping("/test")
    public String testAuthController() {
        return "Auth controller is working.";
    }
}