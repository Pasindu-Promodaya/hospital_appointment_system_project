package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/test/notifications")
@CrossOrigin(origins = "*") // Prevents local browser CORS security blocking mechanisms
public class NotificationTestController {

    @Autowired
    private NotificationService notificationService;

    // Direct sandbox endpoint invocation testing block for Member 2's workflows
    @PostMapping("/lifecycle")
    public String testLifecycleAlertTrigger(@RequestBody Map<String, Object> requestBodyPayload) {
        
        // Dynamic fallback pools for mock verification setups
        int mockToken = requestBodyPayload.get("tokenNumber") != null ? (Integer) requestBodyPayload.get("tokenNumber") : 1;
        int mockQueue = requestBodyPayload.get("queueOrder") != null ? (Integer) requestBodyPayload.get("queueOrder") : 1;
        String mockPatientName = requestBodyPayload.get("patientName") != null ? (String) requestBodyPayload.get("patientName") : "Test Patient";
        String mockDoctorName = requestBodyPayload.get("doctorName") != null ? (String) requestBodyPayload.get("doctorName") : "Dr. Medical Specialist";

        //  Passed all 11 required arguments to completely satisfy the updated service signature
        notificationService.processAppointmentLifecycleChange(
            (Integer) requestBodyPayload.get("appointmentId"),
            (Integer) requestBodyPayload.get("patientId"),
            (String) requestBodyPayload.get("email"),
            (String) requestBodyPayload.get("phone"),
            (String) requestBodyPayload.get("status"),
            (String) requestBodyPayload.get("date"),
            (String) requestBodyPayload.get("time"),
            mockPatientName,
            mockDoctorName,
            mockToken,
            mockQueue
        );
        return "Transactional structural lifecycle tracking call complete.";
    }

    // Direct sandbox endpoint invocation testing block for Member 4's queue sequencer loops
    @PostMapping("/queue-step")
    public String testQueueStepAlertTrigger(@RequestBody Map<String, Object> requestBodyPayload) {
        notificationService.monitorQueueProximityAndNotify(
            (Integer) requestBodyPayload.get("currentServingToken"),
            (Integer) requestBodyPayload.get("patientTargetToken"),
            (String) requestBodyPayload.get("phone"),
            (Integer) requestBodyPayload.get("appointmentId"),
            (Integer) requestBodyPayload.get("patientId")
        );
        return "System checked queue parameters. Proximity alert message sent if criteria met.";
    }
}