package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.model.Doctor;
import com.hospital.appointment.system.model.DoctorSchedule;
import com.hospital.appointment.system.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:5173") // Dynamically links to your Vite frontend port
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    // 1. Endpoint to register or update a doctor profile
    // URL: POST http://localhost:8080/api/doctors
    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.saveDoctor(doctor));
    }

    // 2. Endpoint to view doctors (Optionally filtered by specialty department)
    // URL: GET http://localhost:8080/api/doctors?specialty=Cardiology
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors(@RequestParam(required = false) String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    // 3. Endpoint to attach a weekly work shift schedule to a doctor profile
    // URL: POST http://localhost:8080/api/doctors/schedules
    @PostMapping("/schedules")
    public ResponseEntity<DoctorSchedule> createSchedule(@RequestBody DoctorSchedule schedule) {
        return ResponseEntity.ok(doctorService.saveSchedule(schedule));
    }

    // 4. THE CORE ENGINE LINK: Fetches generated 15-minute selection blocks for bookings
    // URL: GET http://localhost:8080/api/doctors/schedules/{id}/slots
    @GetMapping("/schedules/{scheduleId}/slots")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(doctorService.generateAvailableSlots(scheduleId));
    }
}