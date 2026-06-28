package com.hospital.appointment.system.service;

import com.hospital.appointment.system.dto.DoctorRegisterDTO;
import com.hospital.appointment.system.model.Doctor;
import com.hospital.appointment.system.model.User;
import com.hospital.appointment.system.model.UserRole;
import com.hospital.appointment.system.repository.DoctorRepository;
import com.hospital.appointment.system.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DoctorService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Transactional
    public Doctor registerNewDoctor(DoctorRegisterDTO dto) {

        // check if the email already exists in users table
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already registered in the system!");
        }

        //user login
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(dto.getPassword());
        user.setRole(UserRole.DOCTOR);

        // create the doctor detailed profile linke to user account
        Doctor doctor = new Doctor();
        doctor.setUser(user); // Map the 1:1 relationship
        doctor.setFirstName(dto.getFirstName());
        doctor.setLastName(dto.getLastName());
        doctor.setName(dto.getFirstName() + " " + dto.getLastName());
        doctor.setEmail(dto.getEmail());
        doctor.setTelephoneNumber(dto.getTelephoneNumber());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setSpecialty(dto.getSpecialization());
        doctor.setLicenseNumber(dto.getLicenseNumber());
        doctor.setCreatedByAdminId(dto.getCreatedByAdminId());

        // save to database
        return doctorRepository.save(doctor);
    }
}