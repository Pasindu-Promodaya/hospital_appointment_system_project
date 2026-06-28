package com.hospital.appointment.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// 🌟 FIX: Uses a String name configuration lookup so it compiles perfectly without errors
@SpringBootApplication(excludeName = { 
    "org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration" 
})
public class AppointmentSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppointmentSystemApplication.class, args);
    }

}