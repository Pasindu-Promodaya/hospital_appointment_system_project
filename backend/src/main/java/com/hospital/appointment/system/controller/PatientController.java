package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.model.Patient;
import com.hospital.appointment.system.service.PatientService;
import com.hospital.appointment.system.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}) // Added 3000 just in case
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private PatientRepository patientRepository;

    // 🎯 PATH 1: Fetch directly using the true PATIENT ID (e.g., /api/patients/profile/17)
    @GetMapping("/profile/{patientId}")
    public ResponseEntity<?> getPatientByPatientId(@PathVariable Long patientId) {
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isPresent()) {
            return ResponseEntity.ok(patientOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(" Profile Record Missing: No patient found matching profile ID " + patientId);
    }

    
    @GetMapping("/{userId}")
    public ResponseEntity<?> getPatientProfile(@PathVariable Long userId) {
        try {
            Patient patient = patientService.getPatientByUserId(userId);
            if (patient != null) {
                return ResponseEntity.ok(patient);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ Database Record Missing: No profile found matching user ID " + userId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // 🛠️ PATH 3: Map-driven fallback update processor now targeting PATIENT ID
    @PutMapping("/{patientId}") 
    public ResponseEntity<?> updateProfile(@PathVariable Long patientId, @RequestBody Map<String, Object> payload) {
        try {
            
            Optional<Patient> patientOpt = patientRepository.findById(patientId);
            
            if (patientOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(" Profile Missing: No patient record found matching patient reference key ID: " + patientId);
            }

            Patient existingPatient = patientOpt.get();

            // Extract values safely as generic text strings or primitives
            if (payload.containsKey("firstName")) existingPatient.setFirstName((String) payload.get("firstName"));
            if (payload.containsKey("lastName")) existingPatient.setLastName((String) payload.get("lastName"));
            if (payload.containsKey("bloodType")) existingPatient.setBloodType((String) payload.get("bloodType"));
            if (payload.containsKey("knownDrugAllergies")) existingPatient.setKnownDrugAllergies((String) payload.get("knownDrugAllergies"));
            if (payload.containsKey("chronicConditions")) existingPatient.setChronicConditions((String) payload.get("chronicConditions"));
            if (payload.containsKey("emergencyContactDetails")) existingPatient.setEmergencyContactDetails((String) payload.get("emergencyContactDetails"));

            // Dynamic safe phone key mapper
            if (payload.containsKey("phone")) {
                existingPatient.setPhone((String) payload.get("phone"));
            } else if (payload.containsKey("telephoneNumber")) {
                existingPatient.setPhone((String) payload.get("telephoneNumber"));
            }

            // Safe String to LocalDate parser protection
            if (payload.containsKey("dateOfBirth") && payload.get("dateOfBirth") != null) {
                existingPatient.setDateOfBirth(LocalDate.parse((String) payload.get("dateOfBirth")));
            }

            // 🎯 GENDER HANDLING: Normalize input strings
            if (payload.containsKey("gender") && payload.get("gender") != null) {
                String rawGender = ((String) payload.get("gender")).trim();
                if (!rawGender.isEmpty()) {
                    String normalizedGender = rawGender.substring(0, 1).toUpperCase() + rawGender.substring(1).toLowerCase();
                    existingPatient.setGender(normalizedGender);
                }
            }

            Patient savedPatient = patientRepository.save(existingPatient);
            return ResponseEntity.ok(savedPatient);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Data Mapping Contradiction: " + e.getMessage());
        }
    }
}