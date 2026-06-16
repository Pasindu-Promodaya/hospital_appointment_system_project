package com.hospital.appointment.system.service;

import com.hospital.appointment.system.dto.AppointmentRequest;
import com.hospital.appointment.system.dto.AppointmentResponse;

import java.util.List;

public interface AppointmentService {

    AppointmentResponse bookAppointment(AppointmentRequest request);

    List<AppointmentResponse> getAllAppointments();

    AppointmentResponse getAppointmentById(Long id);

    List<AppointmentResponse> getAppointmentsByDoctor(Long doctorId);

    List<AppointmentResponse> getAppointmentsByPatient(Long patientId);

    AppointmentResponse cancelAppointment(Long id);
}