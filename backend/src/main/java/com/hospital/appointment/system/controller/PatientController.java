package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.model.Patient;
import com.hospital.appointment.system.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*") 
public class PatientController {

    @Autowired
    private PatientService patientService;

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