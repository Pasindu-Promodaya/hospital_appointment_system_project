package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.DoctorRegisterDTO;
import com.hospital.appointment.system.model.Doctor;
import com.hospital.appointment.system.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
// added allowCredentials configuration to match security policy standards
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {

    @Autowired
    private DoctorService doctorService;

    // Endpoint for Admin to register a new Doctor
    @PostMapping("/register-doctor")
    public ResponseEntity<?> registerDoctor(@RequestBody DoctorRegisterDTO doctorRegisterDTO) {
        try {
            Doctor savedDoctor = doctorService.registerNewDoctor(doctorRegisterDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Doctor profile created successfully with ID: " + savedDoctor.getId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    // Export registered practitioner details straight into dropdown components
    // NOTE: Because of the class-level @RequestMapping, this URL is: GET /api/admin/doctors
    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllRegisteredDoctors() {
        // execute service array query call
        List<Doctor> activeDoctorsList = doctorService.getAllDoctors();
        return ResponseEntity.ok(activeDoctorsList);
    }
}