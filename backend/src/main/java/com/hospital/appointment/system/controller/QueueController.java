package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.QueueResponseDTO;
import com.hospital.appointment.system.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/queue")
// 🎯 FIXED: Removed local @CrossOrigin to force the use of global CorsConfig.java
public class QueueController {

    @Autowired
    private QueueService queueService;

    @GetMapping("/status")
    public ResponseEntity<QueueResponseDTO> getDefaultQueueStatus() {
        QueueResponseDTO response = queueService.getDoctorQueueStatus(1L);
        response.setTableRecords(queueService.getActiveAppointmentsList(1L));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{doctorId}")
    public ResponseEntity<QueueResponseDTO> getDoctorQueueStatus(@PathVariable Long doctorId) {
        QueueResponseDTO response = queueService.getDoctorQueueStatus(doctorId);
        response.setTableRecords(queueService.getActiveAppointmentsList(doctorId));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/call-next/{doctorId}")
    public ResponseEntity<?> advanceDoctorQueue(
            @PathVariable Long doctorId,
            @RequestHeader(value = "Admin-Id", required = false) Long adminId) {

        if (adminId == null) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: Administrative action verification headers missing.");
        }

        try {
            queueService.processNextPatient(doctorId);
            return ResponseEntity.ok("Successfully updated token stack pointer.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}