
package com.bearscafe.backend.config;

import com.bearscafe.backend.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                )
        );

        configuration.setExposedHeaders(
                List.of("Authorization")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Public login endpoint
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/login"
                        )
                        .permitAll()

                        // Public test endpoint
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/auth/test"
                        )
                        .permitAll()

                        // Students, staff, and admin can view today's meals
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/meals/today"
                        )
                        .hasAnyRole(
                                "STUDENT",
                                "STAFF",
                                "ADMIN"
                        )

                        // Staff and admin can view all meals
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/meals",
                                "/api/meals/*"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "ADMIN"
                        )

                        // Staff and admin can create meals
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/meals",
                                "/api/meals/**"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "ADMIN"
                        )

                        // Staff and admin can update meals
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/meals/**"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "ADMIN"
                        )

                        // Staff and admin can delete meals
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/meals/**"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "ADMIN"
                        )

                        // Staff and admin can upload dish images
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/dishes/*/image"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "ADMIN"
                        )

                        // Authenticated users can view dish images
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/dishes/images/*"
                        )
                        .permitAll()

                        // Deny other dish endpoints by default
                        .requestMatchers(
                                "/api/dishes/**"
                        )
                        .denyAll()


                        // Students can submit or update a complete meal review
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/reviews/meal/*"
                        )
                        .hasRole("STUDENT")

                        // Students can view their own complete meal review
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/reviews/meal/*/my-review"
                        )
                        .hasRole("STUDENT")

                        // Students can view their own rating
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/ratings/meal/*/my-rating"
                        )
                        .hasRole("STUDENT")

                        // Students can create or update ratings
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/ratings/meal/*"
                        )
                        .hasRole("STUDENT")

                        // Staff and admin can view ratings
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/ratings/meal/*"
                        )
                        .hasAnyRole(
                                "STAFF",
                                "ADMIN"
                        )

                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}