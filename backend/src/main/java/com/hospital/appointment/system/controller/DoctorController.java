package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.model.Doctor;
import com.hospital.appointment.system.model.DoctorSchedule;
import com.hospital.appointment.system.service.DoctorService;
import com.hospital.appointment.system.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}) 
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private ScheduleRepository scheduleRepository; 

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
   
    @GetMapping("/{doctorId}/schedule")
    public ResponseEntity<?> getDoctorSchedule(@PathVariable Long doctorId, @RequestParam String day) {
        
        
        Optional<DoctorSchedule> schedule = scheduleRepository.findFirstByDoctorIdAndDayOfWeek(doctorId, day);

        if (schedule.isPresent()) {
            return ResponseEntity.ok(schedule.get());
        } else {
           
            return ResponseEntity.ok().body("{}");
        }
    }

    
    @PutMapping("/appointments/{appointmentId}/no-show")
    public ResponseEntity<String> handlePatientNoShow(@PathVariable Long appointmentId) {
        try {
            doctorService.cycleNoShowPatientToEnd(appointmentId);
            return ResponseEntity.ok("Patient successfully moved to the bottom of the list.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}