package com.hospital.appointment.system.service;

import com.hospital.appointment.system.model.Patient;
import com.hospital.appointment.system.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    // Fetches profiles matching the relational user identity tracking key
    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElse(null); // Returns null so your controller drops a clean 404 block instead of crashing
    }

    public Patient updatePatient(Long userId, Patient patientDetails) {
        Patient existingPatient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient record not found for user ID: " + userId));

        existingPatient.setFirstName(patientDetails.getFirstName());
        existingPatient.setLastName(patientDetails.getLastName());
        existingPatient.setPhone(patientDetails.getPhone());
        existingPatient.setGender(patientDetails.getGender());
        existingPatient.setBloodType(patientDetails.getBloodType());
        existingPatient.setChronicConditions(patientDetails.getChronicConditions());
        existingPatient.setKnownDrugAllergies(patientDetails.getKnownDrugAllergies());
        existingPatient.setEmergencyContactDetails(patientDetails.getEmergencyContactDetails());
        existingPatient.setDateOfBirth(patientDetails.getDateOfBirth());
        existingPatient.setEmail(patientDetails.getEmail());

        return patientRepository.save(existingPatient);
    }
}