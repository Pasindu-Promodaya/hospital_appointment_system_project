package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.DoctorRegisterDTO;
import com.hospital.appointment.system.model.Doctor;
import com.hospital.appointment.system.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private DoctorService doctorService;

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
}