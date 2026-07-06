package com.hospital.appointment.system.service;

import com.hospital.appointment.system.dto.QueueResponseDTO;
import com.hospital.appointment.system.model.Appointment;
import com.hospital.appointment.system.model.AppointmentStatus;
import com.hospital.appointment.system.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class QueueService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // get queue data for dashboard view
    public QueueResponseDTO getDoctorQueueStatus(Long doctorId) {
        LocalDate today = LocalDate.now();

        // 🎯 BULLETPROOF FIX: Use List instead of Optional to prevent NonUniqueResultException crashes
        List<Appointment> activeList = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.CALLED);

        // 🎯 FIXED: Changed PENDING to CONFIRMED to match the booking system
        List<Appointment> pendingList = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.CONFIRMED);

        //count completed patients for metrics panel
        List<Appointment> completedList = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.COMPLETED);
        int servedCount = completedList.size();

        String activeToken = "None";
        String activePatientName = "None";

        if (!activeList.isEmpty()) {
            Appointment activeApp = activeList.get(0); // Safely grab the first one
            // convert integer token to string safely
            activeToken = String.valueOf(activeApp.getTokenNumber());
            // use patient id as fallback name since getPatient() does not exist
            activePatientName = "Patient ID: " + activeApp.getPatientId();
        }

        int waitingCount = pendingList.size();

        // write terminal audit logs
        List<String> auditLogs = new ArrayList<>();
        auditLogs.add("[SYSTEM]: Channel connected for Doctor ID: " + doctorId);
        auditLogs.add("[METRICS]: Waiting patients count: " + waitingCount);
        if (servedCount > 0) {
            auditLogs.add("[LOG]: Completed " + servedCount + " sessions today.");
        }

        return new QueueResponseDTO(
                activeToken,
                activePatientName,
                waitingCount,
                servedCount,
                "12 mins",
                getActiveAppointmentsList(doctorId),
                auditLogs
        );
    }

    // handle call next action business logic
    @Transactional
    public void processNextPatient(Long doctorId) {
        LocalDate today = LocalDate.now();

        // 🎯 BULLETPROOF FIX: Sweeps up ALL patients stuck in CALLED status and completes them
        List<Appointment> currentActiveList = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.CALLED);

        if (!currentActiveList.isEmpty()) {
            for (Appointment activeApp : currentActiveList) {
                activeApp.setStatus(AppointmentStatus.COMPLETED);
                appointmentRepository.save(activeApp);
            }
        }

        // load pending stack 
        List<Appointment> pendingList = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.CONFIRMED);

        if (pendingList.isEmpty()) {
            throw new RuntimeException("No remaining patients left waiting in the queue buffer.");
        }

        // move pointer to next patient
        Appointment nextApp = pendingList.get(0);
        nextApp.setStatus(AppointmentStatus.CALLED);
        appointmentRepository.save(nextApp);
    }

    // helper method to populate active data grids
    public List<Appointment> getActiveAppointmentsList(Long doctorId) {
        LocalDate today = LocalDate.now();
        List<Appointment> completeList = new ArrayList<>();

        // 1. Add the patient currently in the room (CALLED)
        completeList.addAll(appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.CALLED));

        // 2. Add the patients waiting in line (CONFIRMED)
        completeList.addAll(appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.CONFIRMED));

        // 3. Add the patients who are already done (COMPLETED) at the bottom
        completeList.addAll(appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.COMPLETED));

        return completeList;
    }
}