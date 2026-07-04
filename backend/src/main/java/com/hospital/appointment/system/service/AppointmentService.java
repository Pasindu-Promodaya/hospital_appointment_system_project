package com.hospital.appointment.system.service;

import com.hospital.appointment.system.model.Appointment;
import com.hospital.appointment.system.model.AppointmentStatus;
import com.hospital.appointment.system.repository.AppointmentRepository;
import com.hospital.appointment.system.dto.AppointmentRequest;
import com.hospital.appointment.system.dto.DoctorResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

    public List<com.hospital.appointment.system.dto.AppointmentDetailsResponse> getAppointmentsByPatient(Long patientId) {
    return appointmentRepository.findAppointmentsWithDoctorDetails(patientId)
        .stream()
        .map(obj -> new com.hospital.appointment.system.dto.AppointmentDetailsResponse(
                ((Number) obj[0]).longValue(),
                ((Number) obj[1]).longValue(),
                (String) obj[2],
                (String) obj[3],
                java.time.LocalDate.parse(obj[4].toString()),
                obj[5].toString(),
                ((Number) obj[6]).intValue(),
                ((Number) obj[7]).intValue(),
                (String) obj[8],
                (String) obj[9]
        ))
        .collect(Collectors.toList());
    }
    
    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public List<String> getAllSpecializations() {
        return appointmentRepository.findDistinctSpecializations();
    }

    public List<DoctorResponse> getDoctorsBySpecialization(String specialization) {
        return appointmentRepository.findDoctorsBySpecialization(specialization)
                .stream()
                .map(obj -> new DoctorResponse(((Number) obj[0]).longValue(), (String) obj[1]))
                .collect(Collectors.toList());
    }

    /**
     * Generates a doctor's sequential baseline slots for a given day.
     */
    private List<LocalTime> generateMasterSlotsForDay(Long doctorId, LocalDate date) {
        String dayOfWeek = date.getDayOfWeek().name();
        List<Object[]> scheduleRows = appointmentRepository.findDoctorScheduleByDay(doctorId, dayOfWeek);
        List<LocalTime> masterSlots = new ArrayList<>();
        
        if (scheduleRows.isEmpty()) {
            return masterSlots; 
        }

        Object[] schedule = scheduleRows.get(0);
        
        // Safe type extraction regardless of underlying database driver type conversion
        LocalTime startTime = LocalTime.parse(schedule[0].toString());
        LocalTime endTime = LocalTime.parse(schedule[1].toString());
        int slotDuration = ((Number) schedule[2]).intValue();

        LocalTime loopTime = startTime;
        while (loopTime.plusMinutes(slotDuration).isBefore(endTime) || loopTime.plusMinutes(slotDuration).equals(endTime)) {
            masterSlots.add(loopTime);
            loopTime = loopTime.plusMinutes(slotDuration);
        }
        return masterSlots;
    }

    public List<LocalTime> getAvailableTimeSlots(Long doctorId, LocalDate date) {
        List<LocalTime> masterSlots = generateMasterSlotsForDay(doctorId, date);
        if (masterSlots.isEmpty()) {
            return masterSlots;
        }

        // Fetch raw booked slots and convert them into clean formatted strings (HH:mm)
        List<Object> rawBookedSlots = appointmentRepository.findBookedSlotsByDoctorAndDate(doctorId, date);
        List<String> bookedStrings = rawBookedSlots.stream()
                .map(obj -> {
                    String timeStr = obj.toString();
                    // Keep only HH:mm from format length (handles HH:mm:ss strings safely)
                    return timeStr.substring(0, 5);
                })
                .collect(Collectors.toList());

        // Filter out slots by string comparison to prevent driver-level object mismatches
        return masterSlots.stream()
                .filter(slot -> !bookedStrings.contains(slot.format(timeFormatter)))
                .collect(Collectors.toList());
    }

    public Appointment bookAppointment(Long patientId, AppointmentRequest request) {
        List<LocalTime> masterSlots = generateMasterSlotsForDay(request.getDoctorId(), request.getAppointmentDate());
        
        // Convert the baseline schedule to standard strings for reliable indexing
        List<String> masterSlotStrings = masterSlots.stream()
                .map(slot -> slot.format(timeFormatter))
                .collect(Collectors.toList());
        
        String requestedSlotString = request.getTimeSlot().format(timeFormatter);
        
        // Find the slot's chronological index position
        int slotIndex = masterSlotStrings.indexOf(requestedSlotString);
        if (slotIndex == -1) {
            throw new IllegalArgumentException("Selected time slot does not align with the doctor's active configuration schedule.");
        }
        
        // Token sequence calculation matches the slot order (Index 0 -> Token #1)
        int sequentialToken = slotIndex + 1;

        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setDoctorId(request.getDoctorId());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setMedicalProblem(request.getMedicalProblem());
        appointment.setStatus(AppointmentStatus.PENDING);
        
        // Update both required queue columns in the database table
        appointment.setTokenNumber(sequentialToken);
        appointment.setQueueOrder(sequentialToken);
        
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());
        
        return appointmentRepository.save(appointment);
    }

    // Reschedule
    public Appointment rescheduleAppointment(Long id, Long patientId, com.hospital.appointment.system.dto.RescheduleRequest request) {
    Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment record not found."));

    // Security boundary: Validate entity ownership
    if (!appointment.getPatientId().equals(patientId)) {
        throw new IllegalArgumentException("Unauthorized action.");
    }

    // 1. Fetch the master schedule layout for the SAME doctor on the NEW date
    List<LocalTime> masterSlots = generateMasterSlotsForDay(appointment.getDoctorId(), request.getNewDate());
    
    // 2. Map times to strings to identify the new line index accurately
    List<String> masterSlotStrings = masterSlots.stream()
            .map(slot -> slot.format(timeFormatter))
            .collect(Collectors.toList());

    String requestedSlotString = request.getNewTimeSlot().format(timeFormatter);
    int slotIndex = masterSlotStrings.indexOf(requestedSlotString);
    
    if (slotIndex == -1) {
        throw new IllegalArgumentException("The selected slot does not align with the doctor's schedule on this day.");
    }

    // 3. Compute new chronological layout parameters
    int newSequentialToken = slotIndex + 1;

    // 4. Update the appointment entity fields
    appointment.setAppointmentDate(request.getNewDate());
    appointment.setTimeSlot(request.getNewTimeSlot());
    appointment.setTokenNumber(newSequentialToken);
    appointment.setQueueOrder(newSequentialToken);
    appointment.setStatus(AppointmentStatus.PENDING); // Reverts to pending for admin validation
    appointment.setUpdatedAt(LocalDateTime.now());

    return appointmentRepository.save(appointment);
    }

    public Appointment cancelAppointment(Long id, Long patientId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

        if (!appointment.getPatientId().equals(patientId)) {
            throw new IllegalArgumentException("Unauthorized action.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setUpdatedAt(LocalDateTime.now());
        return appointmentRepository.save(appointment);
    }
}