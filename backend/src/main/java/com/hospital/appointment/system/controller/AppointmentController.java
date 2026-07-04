package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.DoctorQueueResponse;
import com.hospital.appointment.system.model.AppointmentStatus;
import com.hospital.appointment.system.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository; // 🎯 FIXED: Direct injection

    @GetMapping("/doctor-queue/{doctorId}")
    public ResponseEntity<List<DoctorQueueResponse>> getDoctorTodayQueue(@PathVariable Long doctorId) {
        
        // 🎯 FIXED: Call the repository directly
        List<Object[]> rawQueue = appointmentRepository.findTodayQueueByDoctorAndDate(doctorId, LocalDate.now());
        
        List<DoctorQueueResponse> response = rawQueue.stream().map(row -> {
            Long id = ((Number) row[0]).longValue();
            int tokenNumber = row[1] != null ? ((Number) row[1]).intValue() : 0;
            String patientName = String.valueOf(row[2]);
            
            LocalDate apptDate = LocalDate.now();
            if (row[3] != null) {
                if (row[3] instanceof java.sql.Date) {
                    apptDate = ((java.sql.Date) row[3]).toLocalDate();
                } else {
                    apptDate = LocalDate.parse(row[3].toString());
                }
            }
            
            String timeSlotStr = "00:00";
            if (row[4] != null) {
                String rawTime = row[4].toString();
                timeSlotStr = rawTime.length() >= 5 ? rawTime.substring(0, 5) : rawTime;
            }
            
            String rawStatus = row[5] != null ? String.valueOf(row[5]).toUpperCase() : "PENDING";
            String status = switch (rawStatus) {
                case "CONFIRMED" -> "SERVING";
                case "PENDING"   -> "WAITING";
                default          -> rawStatus;
            };
            
            String medicalProblem = row[6] != null ? String.valueOf(row[6]) : "No symptoms described.";
            String phone = row[7] != null ? String.valueOf(row[7]) : "Not Provided";
            String email = row[8] != null ? String.valueOf(row[8]) : "Not Provided";

            return new DoctorQueueResponse(
                id, tokenNumber, patientName, apptDate, timeSlotStr, status, medicalProblem, phone, email
            );
        }).toList();

        return ResponseEntity.ok(response);
    }

    // 📢 HANDLE "CALL NEXT" ACTION
    @PutMapping("/{id}/next")
    public ResponseEntity<Void> callNextPatient(@PathVariable Long id) {
        appointmentRepository.findById(id).ifPresent(appointment -> {
            // Transition patient to active state (CONFIRMED -> maps to SERVING on UI)
            appointment.setStatus(AppointmentStatus.CONFIRMED);
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentRepository.save(appointment);
        });
        return ResponseEntity.ok().build();
    }

    // ❌↩️ UPDATED: HANDLE "NO-SHOW" ACTION WITH SCHEDULE VALIDATION
    @PutMapping("/{id}/no-show")
    public ResponseEntity<Void> handleNoShowPatient(@PathVariable Long id) {
        appointmentRepository.findById(id).ifPresent(appointment -> {
            LocalDateTime now = LocalDateTime.now();
            boolean isPastScheduleEnd = false;

            try {
                // 1. Get today's day name string (e.g., "SATURDAY")
                String currentDayStr = now.getDayOfWeek().name();

                // 2. Fetch the rostered shift using your existing repository query structure
                List<Object[]> scheduleRows = appointmentRepository.findDoctorScheduleByDay(
                    appointment.getDoctorId(), 
                    currentDayStr
                );

                if (!scheduleRows.isEmpty() && scheduleRows.get(0)[1] != null) {
                    // Extract end_time string (expected index 1 based on your repository definition)
                    String endTimeStr = scheduleRows.get(0)[1].toString(); 
                    
                    // Parse raw time cleanly (handles variations like "12:00:00" or "12:00")
                    LocalTime shiftEndTime = LocalTime.parse(endTimeStr.substring(0, 5));
                    LocalTime currentLocalTime = now.toLocalTime();

                    if (currentLocalTime.isAfter(shiftEndTime)) {
                        isPastScheduleEnd = true;
                    }
                }
            } catch (Exception e) {
                // Fallback: If no shift configuration exists or parsing breaks, treat shift as active
                isPastScheduleEnd = false;
            }

            // 3. route state transition depending on shift boundaries
            if (isPastScheduleEnd) {
                // Shift has completely ended -> Send the appointment straight to a CANCELLED state
                appointment.setStatus(AppointmentStatus.CANCELLED);
            } else {
                // Shift is still active -> Recalculate max current queue order and move to bottom
                Integer maxQueueOrder = appointmentRepository.findAll().stream()
                    .filter(a -> a.getDoctorId().equals(appointment.getDoctorId()) 
                            && a.getAppointmentDate().equals(appointment.getAppointmentDate()))
                    .mapToInt(a -> a.getQueueOrder() != null ? a.getQueueOrder() : 0)
                    .max()
                    .orElse(0);

                appointment.setQueueOrder(maxQueueOrder + 1);
                appointment.setStatus(AppointmentStatus.PENDING); // Keeps it active as "WAITING"
            }

            appointment.setUpdatedAt(now);
            appointmentRepository.save(appointment);
        });
        
        return ResponseEntity.ok().build();
    }
}