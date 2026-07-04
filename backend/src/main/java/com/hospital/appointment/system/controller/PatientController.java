package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.model.Patient;
import com.hospital.appointment.system.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) // Locked to your active development origins
public class PatientController {

    @Autowired
    private PatientService patientService;

    // 🎯 FIX: Added the missing GET endpoint to fetch records by userId
    @GetMapping("/{userId}")
    public ResponseEntity<?> getPatientProfile(@PathVariable Long userId) {
        try {
            // Reuses your service implementation layer logic
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

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody Patient patientData) {
        try {
            Patient updatedPatient = patientService.updatePatient(userId, patientData);
            return ResponseEntity.ok(updatedPatient);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}