package com.bearscafe.backend.controller;

import com.bearscafe.backend.dto.LoginRequest;
import com.bearscafe.backend.dto.LoginResponse;
import com.bearscafe.backend.entity.User;
import com.bearscafe.backend.security.JwtService;
import com.bearscafe.backend.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            JwtService jwtService
    ) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @GetMapping("/test")
    public String testAuthController() {
        return "Auth controller is working.";
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest
    ) {

        Optional<User> optionalUser =
                userService.getUserByEmail(
                        loginRequest.getEmail()
                );

        if (optionalUser.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Invalid email or password."
                    );
        }

        User user =
                optionalUser.get();

        if (!user.isEnabled()) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "This account is disabled."
                    );
        }

        boolean passwordMatches =
                userService.passwordMatches(
                        loginRequest.getPassword(),
                        user.getPasswordHash()
                );

        if (!passwordMatches) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Invalid email or password."
                    );
        }

        String token =
                jwtService.generateToken(user);

        LoginResponse response =
                new LoginResponse(
                        token,
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name(),
                        "Login successful."
                );

        return ResponseEntity.ok(response);
    }
}