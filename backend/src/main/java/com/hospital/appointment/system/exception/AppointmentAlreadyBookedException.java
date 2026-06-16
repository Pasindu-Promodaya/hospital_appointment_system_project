package com.hospital.appointment.system.exception;

public class AppointmentAlreadyBookedException extends RuntimeException {

    public AppointmentAlreadyBookedException(String message) {
        super(message);
    }
}