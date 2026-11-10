package com.bearscafe.backend.controller;

import com.bearscafe.backend.dto.LoginRequest;
import com.bearscafe.backend.dto.LoginResponse;
import com.bearscafe.backend.dto.SignupRequest;
import com.bearscafe.backend.entity.Role;
import com.bearscafe.backend.entity.User;
import com.bearscafe.backend.security.JwtService;
import com.bearscafe.backend.service.UserService;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile(
                    "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
            );

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

    // Student registration
    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestBody SignupRequest signupRequest
    ) {

        if (signupRequest == null) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Registration information is required."
                    ));
        }

        String name = signupRequest.getName();
        String email = signupRequest.getEmail();
        String password = signupRequest.getPassword();
        String confirmPassword =
                signupRequest.getConfirmPassword();

        // Validate required fields
        if (name == null || name.trim().isEmpty()
                || email == null || email.trim().isEmpty()
                || password == null || password.isEmpty()
                || confirmPassword == null
                || confirmPassword.isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "All fields are required."
                    ));
        }

        name = name.trim();
        email = email.trim().toLowerCase();

        // Validate name
        if (name.length() > 100) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Name must not exceed 100 characters."
                    ));
        }

        // Validate email
        if (email.length() > 254
                || !EMAIL_PATTERN.matcher(email).matches()) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Please enter a valid email address."
                    ));
        }

        // Validate password length
        if (password.length() < 8) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Password must contain at least 8 characters."
                    ));
        }

        // BCrypt only uses the first 72 bytes of a password
        if (password.getBytes(
                java.nio.charset.StandardCharsets.UTF_8
        ).length > 72) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Password is too long."
                    ));
        }

        // Confirm password
        if (!password.equals(confirmPassword)) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Passwords do not match."
                    ));
        }

        // Check whether email is already registered
        if (userService.emailExists(email)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "An account with this email already exists."
                    ));
        }

        try {

            // Public registration always creates STUDENT accounts.
            // The frontend cannot assign STAFF or ADMIN roles.
            User student = userService.createUser(
                    name,
                    email,
                    password,
                    Role.STUDENT
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "id", student.getId(),
                            "name", student.getName(),
                            "email", student.getEmail(),
                            "role", student.getRole().name(),
                            "message",
                            "Student account created successfully."
                    ));

        } catch (DataIntegrityViolationException exception) {

            // Handles duplicate emails if two requests are submitted at nearly the same time.
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "An account with this email already exists."
                    ));

        } catch (RuntimeException exception) {

            if ("A user with this email already exists."
                    .equals(exception.getMessage())) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "message",
                                "An account with this email already exists."
                        ));
            }

            throw exception;
        }
    }

    // EXISTING LOGIN
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