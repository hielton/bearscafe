package com.bearscafe.backend.config;

import com.bearscafe.backend.entity.Role;
import com.bearscafe.backend.service.UserService;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner createTestUsers(
            UserService userService
    ) {

        return args -> {

            // STUDENT TEST ACCOUNT

            String studentEmail =
                    "student@bearscafe.com";

            if (!userService.emailExists(studentEmail)) {

                userService.createUser(
                        "Test Student",
                        studentEmail,
                        "Student123!",
                        Role.STUDENT
                );

                System.out.println(
                        "Student test account created."
                );
            }


            // STAFF TEST ACCOUNT
            
            String staffEmail =
                    "staff@bearscafe.com";

            if (!userService.emailExists(staffEmail)) {

                userService.createUser(
                        "Test Staff",
                        staffEmail,
                        "Staff123!",
                        Role.STAFF
                );

                System.out.println(
                        "Staff test account created."
                );
            }
        };
    }
}