package com.hospital.appointment.system.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    // primary key for doctor table
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String specialty;
    private String availability;
}