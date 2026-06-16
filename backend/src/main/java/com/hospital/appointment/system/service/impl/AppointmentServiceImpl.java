package com.hospital.appointment.system.service.impl;

import com.hospital.appointment.system.dto.AppointmentRequest;
import com.hospital.appointment.system.dto.AppointmentResponse;
import com.hospital.appointment.system.entity.Appointment;
import com.hospital.appointment.system.repository.AppointmentRepository;
import com.hospital.appointment.system.service.AppointmentService;
import com.hospital.appointment.system.exception.AppointmentAlreadyBookedException;
import com.hospital.appointment.system.exception.AppointmentNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;

    @Override
    public AppointmentResponse bookAppointment(AppointmentRequest request) {

        boolean alreadyBooked = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                        request.getDoctorId(),
                        request.getAppointmentDate(),
                        request.getAppointmentTime()
                );

        if (alreadyBooked) {
            throw new AppointmentAlreadyBookedException(
            "Doctor is already booked for this time slot."
            );
        }

        Appointment appointment = Appointment.builder()
                .doctorId(request.getDoctorId())
                .patientId(request.getPatientId())
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status("BOOKED")
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        return mapToResponse(saved);
    }

    @Override
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AppointmentResponse getAppointmentById(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> 
                    new AppointmentNotFoundException("Appointment not found"));

        return mapToResponse(appointment);
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByDoctor(Long doctorId) {

        return appointmentRepository.findByDoctorId(doctorId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByPatient(Long patientId) {

        return appointmentRepository.findByPatientId(patientId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AppointmentResponse cancelAppointment(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        appointment.setStatus("CANCELLED");

        Appointment updated = appointmentRepository.save(appointment);

        return mapToResponse(updated);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .doctorId(appointment.getDoctorId())
                .patientId(appointment.getPatientId())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .build();
    }
}