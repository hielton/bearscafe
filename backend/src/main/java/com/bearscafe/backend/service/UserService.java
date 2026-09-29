package com.bearscafe.backend.service;

import com.bearscafe.backend.entity.Role;
import com.bearscafe.backend.entity.User;
import com.bearscafe.backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // FIND USER BY ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // FIND USER BY EMAIL
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(
                email.trim().toLowerCase()
        );
    }

    // CHECK IF EMAIL ALREADY EXISTS
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(
                email.trim().toLowerCase()
        );
    }

    // CREATE USER WITH HASHED PASSWORD
    public User createUser(
            String name,
            String email,
            String rawPassword,
            Role role
    ) {

        String normalizedEmail =
                email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException(
                    "A user with this email already exists."
            );
        }

        String hashedPassword =
                passwordEncoder.encode(rawPassword);

        User user = new User(
                name,
                normalizedEmail,
                hashedPassword,
                role
        );

        return userRepository.save(user);
    }

    // CHECK PASSWORD DURING LOGIN
    public boolean passwordMatches(
            String rawPassword,
            String hashedPassword
    ) {
        return passwordEncoder.matches(
                rawPassword,
                hashedPassword
        );
    }
}