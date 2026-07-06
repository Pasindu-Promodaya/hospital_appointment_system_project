package com.hospital.appointment.system.controller;

import com.hospital.appointment.system.dto.DoctorQueueResponse;
import com.hospital.appointment.system.model.Appointment;
import com.hospital.appointment.system.model.AppointmentStatus;
import com.hospital.appointment.system.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // =========================================================================
    // 📊 ADMIN DASHBOARD: QUEUE MANAGEMENT ENDPOINTS
    // =========================================================================

    @GetMapping("/doctor-queue/{doctorId}")
    public ResponseEntity<List<DoctorQueueResponse>> getDoctorTodayQueue(@PathVariable Long doctorId) {
        List<Object[]> rawQueue = appointmentRepository.findTodayQueueByDoctorAndDate(doctorId, LocalDate.now());

        List<DoctorQueueResponse> response = rawQueue.stream().map(row -> {
            Long id = ((Number) row[0]).longValue();
            int tokenNumber = row[1] != null ? ((Number) row[1]).intValue() : 0;
            String patientName = String.valueOf(row[2]);

            LocalDate apptDate = LocalDate.now();
            if (row[3] != null) {
                apptDate = LocalDate.parse(row[3].toString());
            }

            String timeSlotStr = row[4] != null ? row[4].toString().substring(0, 5) : "00:00";

            String rawStatus = row[5] != null ? String.valueOf(row[5]).toUpperCase() : "PENDING";
            String status = switch (rawStatus) {
                case "CALLED" -> "CALLED"; 
                case "PENDING" -> "WAITING";
                default -> rawStatus;
            };

            return new DoctorQueueResponse(
                    id, tokenNumber, patientName, apptDate, timeSlotStr, status,
                    row[6] != null ? row[6].toString() : "",
                    row[7] != null ? row[7].toString() : "",
                    row[8] != null ? row[8].toString() : ""
            );
        }).toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctor-served-count/{doctorId}")
    public ResponseEntity<Long> getDoctorServedCount(@PathVariable Long doctorId) {
        long count = appointmentRepository.countServedTodayByDoctorAndDate(doctorId, LocalDate.now());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/next")
    public ResponseEntity<Void> callNextPatient(@PathVariable Long id) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);

        if (appointmentOpt.isPresent()) {
            Appointment nextAppointment = appointmentOpt.get();

            List<Appointment> activeConsultations = appointmentRepository.findByDoctorIdAndStatus(
                    nextAppointment.getDoctorId(),
                    AppointmentStatus.CALLED
            );

            if (!activeConsultations.isEmpty()) {
                for (Appointment current : activeConsultations) {
                    current.setStatus(AppointmentStatus.COMPLETED);
                    current.setUpdatedAt(LocalDateTime.now());
                    appointmentRepository.save(current);
                }
            }

            nextAppointment.setStatus(AppointmentStatus.CALLED);
            nextAppointment.setUpdatedAt(LocalDateTime.now());
            appointmentRepository.save(nextAppointment);

            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // 🎯 NEW: Dedicated endpoint to complete the final patient when nobody is left in the waiting stream
    @PutMapping("/{id}/complete")
    public ResponseEntity<Void> completeAppointment(@PathVariable Long id) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(AppointmentStatus.COMPLETED);
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentRepository.save(appointment);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/no-show")
    public ResponseEntity<Void> handleNoShowPatient(@PathVariable Long id) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            LocalDateTime now = LocalDateTime.now();

            Integer maxQueueOrder = appointmentRepository.findMaxQueueOrderForDoctor(
                    appointment.getDoctorId(),
                    appointment.getAppointmentDate()
            );
            
            appointment.setQueueOrder((maxQueueOrder != null ? maxQueueOrder : 0) + 1);
            appointment.setStatus(AppointmentStatus.PENDING);
            appointment.setUpdatedAt(now);
            
            appointmentRepository.save(appointment);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // =========================================================================
    // 🩺 PATIENT PORTAL: BOOKING & APPOINTMENT ENDPOINTS 
    // =========================================================================

    @GetMapping("/specializations")
    public ResponseEntity<List<String>> getAllSpecializations() {
        return ResponseEntity.ok(appointmentRepository.findDistinctSpecializations());
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<java.util.Map<String, Object>>> getDoctorsBySpecialization(@RequestParam String specialization) {
        List<Object[]> rawDoctors = appointmentRepository.findDoctorsBySpecialization(specialization);
        
        List<java.util.Map<String, Object>> formattedDoctors = rawDoctors.stream().map(doc -> {
            java.util.Map<String, Object> doctorMap = new java.util.HashMap<>();
            doctorMap.put("id", doc[0]);
            doctorMap.put("name", doc[1]);
            return doctorMap;
        }).toList();

        return ResponseEntity.ok(formattedDoctors);
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam Long doctorId, 
            @RequestParam String date) {
        
        try {
            LocalDate requestedDate = LocalDate.parse(date);
            String dayOfWeek = requestedDate.getDayOfWeek().name(); 

            List<Object[]> scheduleRows = appointmentRepository.findDoctorScheduleByDay(doctorId, dayOfWeek);
            
            if (scheduleRows == null || scheduleRows.isEmpty() || scheduleRows.get(0)[0] == null) {
                return ResponseEntity.ok(java.util.Collections.emptyList());
            }

            String startStr = scheduleRows.get(0)[0].toString();
            String endStr = scheduleRows.get(0)[1].toString();

            LocalTime startTime = LocalTime.parse(startStr.length() > 5 ? startStr.substring(0, 5) : startStr);
            LocalTime endTime = LocalTime.parse(endStr.length() > 5 ? endStr.substring(0, 5) : endStr);

            List<Appointment> dailyAppointments = appointmentRepository.findAll().stream()
                    .filter(a -> a.getDoctorId().equals(doctorId) 
                              && a.getAppointmentDate().equals(requestedDate)
                              && a.getStatus() != AppointmentStatus.CANCELLED)
                    .toList();

            List<String> bookedTimes = dailyAppointments.stream()
                    .map(a -> a.getTimeSlot().toString().substring(0, 5)) 
                    .toList();

            List<String> availableSlots = new java.util.ArrayList<>();
            LocalTime currentSlot = startTime;

            while (currentSlot.isBefore(endTime)) {
                String slotString = currentSlot.toString().substring(0, 5); 
                
                if (!bookedTimes.contains(slotString)) {
                    availableSlots.add(slotString + ":00");
                }
                
                currentSlot = currentSlot.plusMinutes(15);
            }

            return ResponseEntity.ok(availableSlots);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Error calculating slots: " + e.getMessage()));
        }
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<?> getMyAppointments(
            @RequestHeader(value = "X-Patient-Id", required = false, defaultValue = "1") Long patientId) {
        try {
            return ResponseEntity.ok(appointmentRepository.findByPatientId(patientId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(
            @RequestHeader(value = "X-Patient-Id", required = false, defaultValue = "1") Long patientId,
            @RequestBody java.util.Map<String, Object> payload) {
        
        try {
            Appointment appt = new Appointment();
            
            Long docId = Long.valueOf(payload.get("doctorId").toString());
            LocalDate apptDate = LocalDate.parse(payload.get("appointmentDate").toString());
            
            appt.setPatientId(patientId);
            appt.setDoctorId(docId);
            appt.setAppointmentDate(apptDate);
            
            String timeStr = payload.get("appointmentTime").toString();
            LocalTime parsedTime = LocalTime.parse(timeStr.length() > 5 ? timeStr.substring(0, 5) : timeStr);
            
            appt.setTimeSlot(parsedTime);
            appt.setAppointmentTime(parsedTime);
            appt.setPatientName("Patient #" + patientId); 
            
            if (payload.get("medicalProblem") != null) {
                appt.setMedicalProblem(payload.get("medicalProblem").toString());
            }
            
            appt.setStatus(AppointmentStatus.CONFIRMED);

            String dayOfWeek = apptDate.getDayOfWeek().name();
            List<Object[]> scheduleRows = appointmentRepository.findDoctorScheduleByDay(docId, dayOfWeek);
            
            int calculatedQueueNumber = 1; 
            
            if (scheduleRows != null && !scheduleRows.isEmpty() && scheduleRows.get(0)[0] != null) {
                String startStr = scheduleRows.get(0)[0].toString();
                LocalTime shiftStartTime = LocalTime.parse(startStr.length() > 5 ? startStr.substring(0, 5) : startStr);
                
                long minutesDifference = java.time.Duration.between(shiftStartTime, parsedTime).toMinutes();
                calculatedQueueNumber = (int) (minutesDifference / 15) + 1;
            }
            
            appt.setQueueOrder(calculatedQueueNumber);
            appt.setTokenNumber(calculatedQueueNumber);
            
            appointmentRepository.save(appt);
            
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "Appointment confirmed successfully!",
                    "queueNumber", calculatedQueueNumber
            ));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Error booking appointment: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(
            @PathVariable Long id, 
            @RequestBody java.util.Map<String, String> payload) {
        
        try {
            return appointmentRepository.findById(id).map(appointment -> {
                if (payload.get("newDate") != null) {
                    appointment.setAppointmentDate(LocalDate.parse(payload.get("newDate")));
                }
                if (payload.get("newTime") != null) {
                    appointment.setTimeSlot(LocalTime.parse(payload.get("newTime")));
                    appointment.setAppointmentTime(LocalTime.parse(payload.get("newTime")));
                }
                appointmentRepository.save(appointment);
                return ResponseEntity.ok(java.util.Map.of("message", "Rescheduled successfully!"));
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Reschedule failed: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long id,
            @RequestHeader(value = "X-Patient-Id", required = false) Long patientId) {
        
        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
            
            if (appointmentOpt.isPresent()) {
                Appointment appointment = appointmentOpt.get();
                appointment.setStatus(AppointmentStatus.CANCELLED);
                appointment.setUpdatedAt(LocalDateTime.now());
                appointmentRepository.save(appointment);
                
                return ResponseEntity.ok(java.util.Map.of("message", "Appointment cancelled successfully."));
            }
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error cancelling appointment: " + e.getMessage());
        }
    }
}