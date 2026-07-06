package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.DoctorRegisterDTO;
import com.hospital.appointment.system.model.Doctor;
import com.hospital.appointment.system.service.DoctorService;
import com.hospital.appointment.system.service.NotificationService;
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

    @Autowired
    private NotificationService notificationService;

    // Endpoint for Admin to register a new Doctor
    @PostMapping("/register-doctor")
    public ResponseEntity<?> registerDoctor(@RequestBody DoctorRegisterDTO doctorRegisterDTO) {
        try {
            // 1. Persist the new physician and handle entity database conversions
            Doctor savedDoctor = doctorService.registerNewDoctor(doctorRegisterDTO);
            
            // 🎯 AUTOMATED ONBOARDING HOOK: Send credentials directly to the physician's email inbox
            try {
                String fullPractitionerName = "Dr. " + savedDoctor.getFirstName() + " " + savedDoctor.getLastName();
                
                // Extract plain-text password from request DTO payload before database encryption hashes it
                String clearPassword = doctorRegisterDTO.getPassword(); 

                notificationService.sendDoctorOnboardingCredentials(
                    savedDoctor.getEmail(),       // Destination email address
                    fullPractitionerName,         // Full practitioner name string
                    clearPassword                 // The plain-text password for initial login
                );
            } catch (Exception mailEx) {
                // Prevents email configuration errors or SMTP server timeouts from crashing the transaction pipeline
                System.err.println("Asynchronous onboarding mail delivery failure framework trace: " + mailEx.getMessage());
            }

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