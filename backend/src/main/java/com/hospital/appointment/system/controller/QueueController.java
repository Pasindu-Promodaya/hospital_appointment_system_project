package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.model.Appointment;
import com.hospital.appointment.system.service.QueueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "*")
public class QueueController {

    @Autowired
    private QueueService queueService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getDefaultQueueStatus() {
        return ResponseEntity.ok(queueService.getQueueStatus(1L));
    }

    // Get queue status for a specific doctor
    @GetMapping("/{doctorId}")
    public ResponseEntity<Map<String, Object>> getQueueStatus(@PathVariable Long doctorId) {
        return ResponseEntity.ok(queueService.getQueueStatus(doctorId));
    }

    // Trigger the next patient Only authenticated admins allow
    @PostMapping("/call-next/{doctorId}")
    public ResponseEntity<?> callNextPatient(
            @PathVariable Long doctorId,
            @RequestHeader(value = "Admin-Id", required = false) Long adminId) {

        // Block request if AdminId header is missing
        if (adminId == null) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: Only authenticated administrators can advance the patient queue.");
        }


        try {
            Appointment nextPatient = queueService.callNextPatient(doctorId);
            return ResponseEntity.ok(nextPatient);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}