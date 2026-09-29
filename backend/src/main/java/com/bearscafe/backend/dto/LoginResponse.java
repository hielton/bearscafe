package com.bearscafe.backend.dto;

public class LoginResponse {

    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String message;

    public LoginResponse(
            String token,
            Long userId,
            String name,
            String email,
            String role,
            String message
    ) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }
}