package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.AuthResponse;
import com.hospital.appointment.system.dto.LoginRequest;
import com.hospital.appointment.system.dto.LoginResponse;
import com.hospital.appointment.system.dto.RegisterRequest;
import com.hospital.appointment.system.model.Patient;
import com.hospital.appointment.system.model.User;
import com.hospital.appointment.system.repository.PatientRepository;
import com.hospital.appointment.system.repository.UserRepository;
import com.hospital.appointment.system.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // Resets testing passwords to match encryption rules on startup
    @PostConstruct
    public void initializeValidTestingPasswords() {
        try {
            String cleanSecureHash = passwordEncoder.encode("password123");
            userRepository.findAll().stream()
                    .forEach(user -> {
                        user.setPasswordHash(cleanSecureHash);
                        userRepository.save(user);
                    });
            System.out.println("All testing user passwords have been synchronized with the new encoder rules.");
        } catch (Exception e) {
            System.err.println("Could not initialize testing passwords: " + e.getMessage());
        }
    }

    // Legacy unified login endpoint to support your dashboard setup
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Email not found!");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash()) &&
                !user.getPasswordHash().equals(loginRequest.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Error: Invalid password!");
        }

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : "DOCTOR",
                "Login successful!"
        );

        return ResponseEntity.ok(response);
    }

    // Register a new patient account
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(com.hospital.appointment.system.model.UserRole.PATIENT);

        User savedUser = userRepository.save(user);

        Patient patient = new Patient();
        patient.setUserId(savedUser.getId());
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        patient.setPhone(request.getPhone());
        patient.setGender(request.getGender()); 

        patientRepository.save(patient);

        return ResponseEntity.ok("Registration successful!");
    }

    // Staff portal login handler
    @PostMapping("/login/staff")
    public ResponseEntity<?> loginStaff(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User account not found in system repository.");
        }

        User user = userOptional.get();
        String roleStr = user.getRoleAsString() != null ? user.getRoleAsString().toUpperCase() : "";

        if (roleStr.contains("PATIENT")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: Patients cannot authenticate through the Provider Gateway.");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Access Denied: Invalid password key.");
        }

        String realJwtToken = jwtTokenProvider.generateToken(user.getEmail(), roleStr);
        Long linkedDoctorId = (user.getDoctor() != null) ? user.getDoctor().getId() : null;

        AuthResponse response = new AuthResponse(realJwtToken, user.getEmail(), roleStr, user.getId(), linkedDoctorId);
        return ResponseEntity.ok(response);
    }

    // Patient portal login handler
    @PostMapping("/login/patient")
    public ResponseEntity<?> loginPatient(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Patient account not found.");
        }

        User user = userOptional.get();
        String roleStr = user.getRoleAsString() != null ? user.getRoleAsString().toUpperCase() : "";

        if (!roleStr.contains("PATIENT")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: Staff accounts must use the Provider Gateway portal.");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Access Denied: Invalid password key.");
        }

        String realJwtToken = jwtTokenProvider.generateToken(user.getEmail(), roleStr);

        Long resolvedPatientProfileId = null;
        Optional<Patient> patientOptional = patientRepository.findAll().stream()
                .filter(p -> p.getUserId() != null && p.getUserId().equals(user.getId()))
                .findFirst();

        if (patientOptional.isPresent()) {
            resolvedPatientProfileId = patientOptional.get().getId();
        }

                AuthResponse response = new AuthResponse(
                realJwtToken, 
                user.getEmail(), 
                roleStr, 
                user.getId(), 
                resolvedPatientProfileId
        );
        
        return ResponseEntity.ok(response);
    }
}