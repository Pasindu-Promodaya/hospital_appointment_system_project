package com.hospital.appointment.system;

import com.hospital.appointment.system.model.User;
import com.hospital.appointment.system.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class AppointmentSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppointmentSystemApplication.class, args);
    }

    @Bean
    public CommandLineRunner initializePasswords(UserRepository userRepository) {
        return args -> {
            // 🔐 Uses your actual Spring Security instance to hash the password correctly
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String secureHash = encoder.encode("password123");

            // Look up your doctor's user account
            userRepository.findByEmail("himal@hospital.com").ifPresent(user -> {
                user.setPassword(secureHash);
                userRepository.save(user);
                System.out.println("✅ SUCCESS: Doctor password updated with valid system hash!");
            });
        };
    }
}