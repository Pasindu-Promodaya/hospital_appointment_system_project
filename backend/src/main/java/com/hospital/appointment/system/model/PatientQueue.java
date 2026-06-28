package com.hospital.appointment.system.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_queues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PatientQueue {

    // primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer tokenNumber;

    @Column(nullable = false)
    private String status; // WAITING, IN_CONSULTATION, COMPLETED

    @Column(nullable = false)
    private String patientName;

    @Column(nullable = false)
    private LocalDateTime checkInTime;

    private LocalDateTime consultationStartTime;
    private LocalDateTime consultationEndTime;

    // join with doctor table using foreign key
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
}