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

    // Fetch the active live queue records for a specific doctor for today
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
                case "CALLED" -> "SERVING";
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

    // 🎯 ADDED: Get the exact total served (COMPLETED) count directly from database for today
    @GetMapping("/doctor-served-count/{doctorId}")
    public ResponseEntity<Long> getDoctorServedCount(@PathVariable Long doctorId) {
        long count = appointmentRepository.countServedTodayByDoctorAndDate(doctorId, LocalDate.now());
        return ResponseEntity.ok(count);
    }

    // Move next patient to active status (CALLED) and safely mark previous profiles as COMPLETED
    @PutMapping("/{id}/next")
    public ResponseEntity<Void> callNextPatient(@PathVariable Long id) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);

        if (appointmentOpt.isPresent()) {
            Appointment nextAppointment = appointmentOpt.get();

            // Find any active consultation row still stuck under this doctor to clear legacy data
            List<Appointment> activeConsultations = appointmentRepository.findByDoctorIdAndStatus(
                    nextAppointment.getDoctorId(),
                    AppointmentStatus.CALLED
            );

            // Change status of all currently active consultations to COMPLETED
            if (!activeConsultations.isEmpty()) {
                for (Appointment current : activeConsultations) {
                    current.setStatus(AppointmentStatus.COMPLETED);
                    current.setUpdatedAt(LocalDateTime.now());
                    appointmentRepository.save(current);
                }
            }

            // Move the next targeted patient into the active consultation state
            nextAppointment.setStatus(AppointmentStatus.CALLED);
            nextAppointment.setUpdatedAt(LocalDateTime.now());
            appointmentRepository.save(nextAppointment);

            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Handle patient no-show cases, move row to end of queue or cancel if roster shift has ended
    @PutMapping("/{id}/no-show")
    public ResponseEntity<Void> handleNoShowPatient(@PathVariable Long id) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (appointmentOpt.isPresent()) {
            Appointment appointment = appointmentOpt.get();
            LocalDateTime now = LocalDateTime.now();
            boolean isPastScheduleEnd = false;

            try {
                List<Object[]> scheduleRows = appointmentRepository.findDoctorScheduleByDay(
                        appointment.getDoctorId(),
                        now.getDayOfWeek().name()
                );

                if (!scheduleRows.isEmpty() && scheduleRows.get(0)[1] != null) {
                    LocalTime shiftEndTime = LocalTime.parse(scheduleRows.get(0)[1].toString().substring(0, 5));
                    if (now.toLocalTime().isAfter(shiftEndTime)) {
                        isPastScheduleEnd = true;
                    }
                }
            } catch (Exception e) {
                isPastScheduleEnd = false;
            }

            // If shift has ended, cancel the booking, else calculate max index and append to queue end
            if (isPastScheduleEnd) {
                appointment.setStatus(AppointmentStatus.CANCELLED);
            } else {
                Integer maxQueueOrder = appointmentRepository.findMaxQueueOrderForDoctor(
                        appointment.getDoctorId(),
                        appointment.getAppointmentDate()
                );
                appointment.setQueueOrder((maxQueueOrder != null ? maxQueueOrder : 0) + 1);
                appointment.setStatus(AppointmentStatus.PENDING);
            }
            appointment.setUpdatedAt(now);
            appointmentRepository.save(appointment);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}