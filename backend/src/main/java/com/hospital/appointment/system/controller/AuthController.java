package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.AuthResponse;
import com.hospital.appointment.system.dto.LoginRequest;
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

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // Keeps your dual multi-port testing origins
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Uses the generic PasswordEncoder matching your clean SecurityConfig bean

    @Autowired
    private JwtTokenProvider jwtTokenProvider; 

    // 🧑‍💻 TEAMMATE'S ENDPOINT: Register new patients into the database repository cleanly
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("❌ Email is already registered!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Securely hashes password via BCrypt
        user.setRole("ROLE_PATIENT"); // Standardizes your role context values

        User savedUser = userRepository.save(user);

        Patient patient = new Patient();
        patient.setUserId(savedUser.getId());
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        patient.setPhone(request.getPhone());

        patientRepository.save(patient);

        return ResponseEntity.ok("🎯 Registration successful!");
    }

    // 🎯 INTEGRATED ENGINE: Unified authentication pipeline for both Doctors and Patients
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

        // 3. Generate a real, cryptographically signed token string
        String realJwtToken = jwtTokenProvider.generateToken(user.getEmail(), user.getRole());

        // 4. Extract linked doctor ID properties safely if the role matches
        Long linkedDoctorId = (user.getDoctor() != null) ? user.getDoctor().getId() : null;

        // 5. Check if patient metadata is attached to handle teammate dashboard hydration requirements
        Optional<Patient> patientOpt = patientRepository.findByUserId(user.getId());
        Patient linkedPatientProfile = patientOpt.orElse(null);

        // 6. Return a comprehensive response containing the token and corresponding active user data hooks
        AuthResponse response = new AuthResponse(
                realJwtToken, 
                user.getEmail(), 
                user.getRole(), 
                linkedDoctorId
        );
        
        // If your AuthResponse DTO allows custom properties, you can also attach the patient object:
        // response.setPatientProfile(linkedPatientProfile);

        return ResponseEntity.ok(response);
    }
}