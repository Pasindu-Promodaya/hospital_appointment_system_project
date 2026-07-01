package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.AuthResponse;
import com.hospital.appointment.system.dto.LoginRequest;
import com.hospital.appointment.system.model.User;
import com.hospital.appointment.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // 🔐 Injected your configured BCrypt engine

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        // 1. Look up user by email context
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("❌ User account not found in system repository.");
        }

        User user = userOptional.get();

        // 2. Validate password using secure BCrypt evaluation matching mechanics
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("❌ Access Denied: Invalid password key.");
        }

        // 3. Simulated token session string execution
        String fallbackToken = "SIMULATED_JWT_TOKEN_FOR_" + user.getEmail().toUpperCase();

        // 4. Extract linked doctor ID property safely if present
        Long linkedDoctorId = (user.getDoctor() != null) ? user.getDoctor().getId() : null;

        // 5. Build and return the clean data transfer object back to your React app
        return ResponseEntity.ok(new AuthResponse(
                fallbackToken, 
                user.getEmail(), 
                user.getRole(), 
                linkedDoctorId
        ));
    }
}