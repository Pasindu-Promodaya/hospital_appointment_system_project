package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.AppointmentRequest;
import com.hospital.appointment.system.dto.AppointmentResponse;
import com.hospital.appointment.system.service.AppointmentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    private final AppointmentService appointmentService;

    // Book an appointment
    @PostMapping
    public AppointmentResponse bookAppointment(
            @Valid @RequestBody AppointmentRequest request) {

        return appointmentService.bookAppointment(request);
    }

    // Get all appointments
    @GetMapping
    public List<AppointmentResponse> getAllAppointments() {

        return appointmentService.getAllAppointments();
    }

    // Get appointment by ID
    @GetMapping("/{id}")
    public AppointmentResponse getAppointmentById(
            @Valid @PathVariable Long id) {

        return appointmentService.getAppointmentById(id);
    }

    // Get appointments by doctor
    @GetMapping("/doctor/{doctorId}")
    public List<AppointmentResponse> getAppointmentsByDoctor(
            @Valid @PathVariable Long doctorId) {

        return appointmentService.getAppointmentsByDoctor(doctorId);
    }

    // Get appointments by patient
    @GetMapping("/patient/{patientId}")
    public List<AppointmentResponse> getAppointmentsByPatient(
            @Valid @PathVariable Long patientId) {

        return appointmentService.getAppointmentsByPatient(patientId);
    }

    // Cancel appointment
    @PatchMapping("/{id}/cancel")
    public AppointmentResponse cancelAppointment(
            @Valid @PathVariable Long id) {

        return appointmentService.cancelAppointment(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> updateAppointment(
        @Valid @PathVariable Long id,
        @Valid @RequestBody AppointmentRequest request) {

    return ResponseEntity.ok(appointmentService.updateAppointment(id, request));
    }
}