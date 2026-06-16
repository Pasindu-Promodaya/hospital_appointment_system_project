package com.hospital.appointment.system.service;

import com.hospital.appointment.system.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import com.hospital.appointment.system.entity.Doctor;
import com.hospital.appointment.system.exception.DoctorNotFoundException;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public Doctor createDoctor(Doctor doctor) {
    return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
    return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {

    return doctorRepository.findById(id)
            .orElseThrow(() ->
                    new DoctorNotFoundException(
                            "Doctor not found with ID: " + id));
    }

    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {

    Doctor doctor = getDoctorById(id);

    doctor.setName(updatedDoctor.getName());
    doctor.setSpecialization(updatedDoctor.getSpecialization());
    doctor.setEmail(updatedDoctor.getEmail());
    doctor.setPhone(updatedDoctor.getPhone());
    doctor.setAvailable(updatedDoctor.getAvailable());

    return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {

    Doctor doctor = getDoctorById(id);

    doctorRepository.delete(doctor);
    }

}