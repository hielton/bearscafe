package com.bearscafe.backend.security;

import com.bearscafe.backend.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final String secretKey;

    private static final long EXPIRATION_TIME =
            1000L * 60 * 60 * 24;

    public JwtService(
            @Value("${jwt.secret}") String secretKey
    ) {
        this.secretKey = secretKey;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                secretKey.getBytes(
                        StandardCharsets.UTF_8
                )
        );
    }

    public String generateToken(User user) {
        Date now = new Date();

        Date expiration =
                new Date(
                        now.getTime() +
                        EXPIRATION_TIME
                );

        return Jwts.builder()
                .subject(user.getEmail())
                .claim(
                        "userId",
                        user.getId()
                )
                .claim(
                        "name",
                        user.getName()
                )
                .claim(
                        "role",
                        user.getRole().name()
                )
                .issuedAt(now)
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractAllClaims(
            String token
    ) {
        return Jwts.parser()
                .verifyWith(
                        getSigningKey()
                )
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(
            String token
    ) {
        return extractAllClaims(token)
                .getSubject();
    }

    public String extractRole(
            String token
    ) {
        return extractAllClaims(token)
                .get(
                        "role",
                        String.class
                );
    }

    public boolean isTokenExpired(
            String token
    ) {
        Date expiration =
                extractAllClaims(token)
                        .getExpiration();

        return expiration.before(
                new Date()
        );
    }

    public boolean isTokenValid(
            String token,
            User user
    ) {
        String email =
                extractEmail(token);

        return email.equals(
                user.getEmail()
        ) &&
                !isTokenExpired(token);
    }
}