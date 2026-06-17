package com.hospital.appointment.system.service.impl;

import com.hospital.appointment.system.dto.AppointmentRequest;
import com.hospital.appointment.system.dto.AppointmentResponse;
import com.hospital.appointment.system.entity.Appointment;
import com.hospital.appointment.system.entity.Doctor;
import com.hospital.appointment.system.entity.Patient;
import com.hospital.appointment.system.exception.AppointmentAlreadyBookedException;
import com.hospital.appointment.system.exception.AppointmentNotFoundException;
import com.hospital.appointment.system.repository.AppointmentRepository;
import com.hospital.appointment.system.repository.DoctorRepository;
import com.hospital.appointment.system.repository.PatientRepository;
import com.hospital.appointment.system.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    @Override
    public AppointmentResponse bookAppointment(AppointmentRequest request) {

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        boolean alreadyBooked =
                appointmentRepository.existsByDoctor_IdAndAppointmentDateAndAppointmentTime(
                        doctor.getId(),
                        request.getAppointmentDate(),
                        request.getAppointmentTime()
                );

        if (alreadyBooked) {
            throw new AppointmentAlreadyBookedException(
                    "Doctor is already booked for this time slot."
            );
        }

        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status("BOOKED")
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return mapToResponse(savedAppointment);
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

        return appointmentRepository.findByDoctor_Id(doctorId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByPatient(Long patientId) {

        return appointmentRepository.findByPatient_Id(patientId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AppointmentResponse cancelAppointment(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new AppointmentNotFoundException("Appointment not found"));

        appointment.setStatus("CANCELLED");

        Appointment updatedAppointment = appointmentRepository.save(appointment);

        return mapToResponse(updatedAppointment);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getName())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getName())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .status(appointment.getStatus())
                .build();
    }

    @Override
        public AppointmentResponse updateAppointment(Long id, AppointmentRequest request) {

        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        // Prevent updating cancelled appointments
        if ("CANCELLED".equals(appointment.getStatus())) {
                throw new RuntimeException("Cannot update a cancelled appointment");
        }

        // Check doctor exists
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        // Check patient exists
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        // Check slot availability (avoid double booking), excluding this appointment itself
        boolean alreadyBooked = appointmentRepository
                .existsByDoctor_IdAndAppointmentDateAndAppointmentTimeAndIdNot(
                        request.getDoctorId(),
                        request.getAppointmentDate(),
                        request.getAppointmentTime(),
                        id
                );

        if (alreadyBooked) {
                throw new AppointmentAlreadyBookedException("Time slot already booked");
        }

        // Update fields
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());

        Appointment updated = appointmentRepository.save(appointment);

        return mapToResponse(updated);
                }
}