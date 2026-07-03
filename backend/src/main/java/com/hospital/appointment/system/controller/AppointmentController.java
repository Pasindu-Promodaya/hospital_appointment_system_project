package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.model.Appointment;
import com.hospital.appointment.system.service.AppointmentService;
import com.hospital.appointment.system.dto.AppointmentRequest;
import com.hospital.appointment.system.dto.DoctorResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<List<com.hospital.appointment.system.dto.AppointmentDetailsResponse>> getMyAppointments(
            @RequestHeader("X-Patient-Id") Long patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId));
}

    @GetMapping("/specializations")
    public ResponseEntity<List<String>> getSpecializations() {
        return ResponseEntity.ok(appointmentService.getAllSpecializations());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponse>> getDoctors(@RequestParam String specialization) {
        return ResponseEntity.ok(appointmentService.getDoctorsBySpecialization(specialization));
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAvailableTimeSlots(doctorId, date));
    }

    @PostMapping("/book")
    public ResponseEntity<Appointment> book(
            @RequestHeader(value = "X-Patient-Id", defaultValue = "1") Long patientId, 
            @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.bookAppointment(patientId, request));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<Appointment> reschedule(
            @PathVariable Long id,
            @RequestHeader("X-Patient-Id") Long patientId,
            @RequestBody com.hospital.appointment.system.dto.RescheduleRequest request) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, patientId, request));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable("id") Long id,
            @RequestHeader("X-Patient-Id") Long patientId) {
        appointmentService.cancelAppointment(id, patientId);
        return ResponseEntity.ok().build();
    }
}
