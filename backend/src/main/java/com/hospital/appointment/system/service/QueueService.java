package com.hospital.appointment.system.service;
import com.hospital.appointment.system.model.Appointment;
import com.hospital.appointment.system.model.AppointmentStatus;
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
import java.util.Optional;

@Service
public class QueueService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // get queue data for dashboard view
    public QueueResponseDTO getDoctorQueueStatus(Long doctorId) {
        LocalDate today = LocalDate.now();

        // get the current active patient
        Optional<Appointment> active = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatus(doctorId, today, AppointmentStatus.CALLED);

        // get remaining waiting patients
        List<Appointment> pendingList = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.PENDING);

        //count completed patients for metrics panel
        List<Appointment> completedList = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.COMPLETED);
        int servedCount = completedList.size();

        String activeToken = "None";
        String activePatientName = "None";

        if (active.isPresent()) {
            Appointment activeApp = active.get();
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
                null,
                auditLogs
        );
    }

    // handle call next action business logic
    @Transactional
    public void processNextPatient(Long doctorId) {
        LocalDate today = LocalDate.now();

        // complete current consultation
        Optional<Appointment> currentActive = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatus(doctorId, today, AppointmentStatus.CALLED);

        if (currentActive.isPresent()) {
            Appointment activeApp = currentActive.get();
            activeApp.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(activeApp);
        }

        // load pending stack
        List<Appointment> pendingList = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.PENDING);

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

        appointmentRepository.findByDoctorIdAndAppointmentDateAndStatus(doctorId, today, AppointmentStatus.CALLED)
                .ifPresent(completeList::add);

        completeList.addAll(appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.PENDING));

        return completeList;
    }
}