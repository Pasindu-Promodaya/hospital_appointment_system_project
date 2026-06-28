package com.hospital.appointment.system.service;

import com.hospital.appointment.system.model.Appointment;
import com.hospital.appointment.system.model.AppointmentStatus;
import com.hospital.appointment.system.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class QueueService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public Map<String, Object> getQueueStatus(Long doctorId) {
        LocalDate today = LocalDate.now();
        Map<String, Object> statusMap = new HashMap<>();

        // get the current active patient (CALLED status)
        Optional<Appointment> active = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatus(doctorId, today, AppointmentStatus.CALLED);

        // get all remaining pending patients in order
        List<Appointment> pendingList = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.PENDING);

        if (active.isPresent()) {
            Appointment activeApp = active.get();
            statusMap.put("activeToken", activeApp.getTokenNumber());
            statusMap.put("activePatientId", String.valueOf(activeApp.getPatientId()));
        } else {
            statusMap.put("activeToken", "None");
            statusMap.put("activePatientId", "None");
        }

        // set next in line token
        if (!pendingList.isEmpty()) {
            statusMap.put("nextToken", pendingList.get(0).getTokenNumber());
        } else {
            statusMap.put("nextToken", "None");
        }

        // set total waiting count
        statusMap.put("waitingCount", pendingList.size());

        return statusMap;
    }

    //call the next patient
    @Transactional
    public Appointment callNextPatient(Long doctorId) {
        LocalDate today = LocalDate.now();

        // complete the current active patient if there is one
        Optional<Appointment> currentActive = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatus(doctorId, today, AppointmentStatus.CALLED);

        if (currentActive.isPresent()) {
            Appointment activeApp = currentActive.get();
            activeApp.setStatus(AppointmentStatus.COMPLETED);
            appointmentRepository.save(activeApp);
        }

        //all pending patients and call the first one in line
        List<Appointment> pendingList = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatusOrderByQueueOrderAsc(doctorId, today, AppointmentStatus.PENDING);

        if (pendingList.isEmpty()) {
            throw new RuntimeException("No remaining patients left waiting in the queue buffer.");
        }

        Appointment nextApp = pendingList.get(0);
        nextApp.setStatus(AppointmentStatus.CALLED);
        return appointmentRepository.save(nextApp);
    }
}