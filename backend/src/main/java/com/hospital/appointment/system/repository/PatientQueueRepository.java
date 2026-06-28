package com.hospital.appointment.system.repository;

import com.hospital.appointment.system.model.PatientQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PatientQueueRepository extends JpaRepository<PatientQueue, Long> {
    // get que data , for doctor
    List<PatientQueue> findByDoctorIdAndStatusInOrderByTokenNumberAsc(Long doctorId, List<String> statuses);
    List<PatientQueue> findByDoctorIdAndStatus(Long doctorId, String status);
}