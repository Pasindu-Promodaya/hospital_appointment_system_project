package com.hospital.appointment.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {

    private Long id;

    private Long doctorId;

    private Long patientId;

    private LocalDate appointmentDate;

    private LocalTime appointmentTime;

    private String status;
}