package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.AuthResponse;
import com.hospital.appointment.system.dto.LoginRequest;
import com.hospital.appointment.system.model.User;
import com.hospital.appointment.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth") // 🌟 Clean, dedicated base route
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        // 1. Look up user by email
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("❌ User account not found in system repository.");
        }

        User user = userOptional.get();

        // 2. Validate plain text password
        if (!loginRequest.getPassword().equals(user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("❌ Access Denied: Invalid password key.");
        }

        // 3. Simulated token session string
        String fallbackToken = "SIMULATED_JWT_TOKEN_FOR_" + user.getEmail().toUpperCase();

        // 4. Get linked doctor ID if present
        Long linkedDoctorId = (user.getDoctor() != null) ? user.getDoctor().getId() : null;

        return ResponseEntity.ok(new AuthResponse(fallbackToken, user.getEmail(), user.getRole(), linkedDoctorId));
    }
}