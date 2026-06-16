package com.hospital.appointment.system.service;

import com.hospital.appointment.system.entity.Patient;
import com.hospital.appointment.system.exception.PatientNotFoundException;
import com.hospital.appointment.system.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() ->
                        new PatientNotFoundException("Patient not found with ID: " + id));
    }

    public Patient updatePatient(Long id, Patient updatedPatient) {

        Patient patient = getPatientById(id);

        patient.setName(updatedPatient.getName());
        patient.setEmail(updatedPatient.getEmail());
        patient.setPhone(updatedPatient.getPhone());
        patient.setAge(updatedPatient.getAge());
        patient.setGender(updatedPatient.getGender());

        return patientRepository.save(patient);
    }

    public void deletePatient(Long id) {

        Patient patient = getPatientById(id);

        patientRepository.delete(patient);
    }
}