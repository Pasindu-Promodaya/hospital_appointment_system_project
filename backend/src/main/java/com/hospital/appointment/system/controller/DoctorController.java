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
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) 
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        return ResponseEntity.ok(doctorService.saveDoctor(doctor));
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors(@RequestParam(required = false) String specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    @PostMapping("/schedules")
    public ResponseEntity<DoctorSchedule> createSchedule(@RequestBody DoctorSchedule schedule) {
        return ResponseEntity.ok(doctorService.saveSchedule(schedule));
    }

    @GetMapping("/schedules/{scheduleId}/slots")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(@PathVariable Long scheduleId) {
        return ResponseEntity.ok(doctorService.generateAvailableSlots(scheduleId));
    }

    @GetMapping("/{doctorId}/queue")
    public ResponseEntity<?> getTodayQueue(@PathVariable Long doctorId) {
        return ResponseEntity.ok(doctorService.getTodayQueue(doctorId));
    }
}