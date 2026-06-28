package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.RegisterRequest;
import com.hospital.appointment.system.model.Patient;
import com.hospital.appointment.system.model.User;
import com.hospital.appointment.system.repository.PatientRepository;
import com.hospital.appointment.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // 1. Check availability using EMAIL
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered!");
        }

        // 2. Create User account credentials
        User user = new User();
        user.setEmail(request.getEmail()); 
        user.setPasswordHash(passwordEncoder.encode(request.getPassword())); 
        
        // --- FIX: Explicitly set the role so it is not NULL ---
        user.setRole("PATIENT"); 
        
        User savedUser = userRepository.save(user); // 'created_at' is handled automatically by the Model

        // 3. Create Patient contact profile
        Patient patient = new Patient();
        patient.setUserId(savedUser.getId()); 
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail()); 
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setPhone(request.getPhone()); 
        
        patientRepository.save(patient);

        return ResponseEntity.ok("Registration successful!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        // 1. Authenticate via EMAIL
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        // 2. Verify hashed password
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            Optional<Patient> patientOpt = patientRepository.findByUserId(userOpt.get().getId());
            return ResponseEntity.ok(patientOpt.orElse(null));
        }

        return ResponseEntity.status(401).body("Invalid email or password!");
    }
}