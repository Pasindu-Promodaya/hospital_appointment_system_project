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
// 🌟 Updated to allow both 5173 and 5174 frontend development ports cleanly
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) 
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    // 1. Endpoint to register or update a doctor profile (Used by Member 4 Admin)
    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.saveDoctor(doctor));
    }

    // 2. Endpoint to view doctors (Used by Patients inside your DoctorDirectory.jsx)
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors(@RequestParam(required = false) String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    // 3. Endpoint to attach a weekly work shift schedule (Used by You in DoctorDashboard.jsx)
    @PostMapping("/schedules")
    public ResponseEntity<DoctorSchedule> createSchedule(@RequestBody DoctorSchedule schedule) {
        return ResponseEntity.ok(doctorService.saveSchedule(schedule));
    }

    // 4. THE CORE ENGINE LINK: Fetches generated 15-minute selection blocks (Used by Member 2)
    @GetMapping("/schedules/{scheduleId}/slots")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(doctorService.generateAvailableSlots(scheduleId));
    }
}