package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.LoginRequest;
import com.hospital.appointment.system.dto.LoginResponse;
import com.hospital.appointment.system.model.User;
import com.hospital.appointment.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Email not found!");
        }

        User user = userOptional.get();

        // Checking password
        if (!user.getPasswordHash().equals(loginRequest.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid password!");
        }

        // Return user details with their specific role (ADMIN / DOCTOR)
        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                "Login successful!"
        );

        return ResponseEntity.ok(response);
    }
}