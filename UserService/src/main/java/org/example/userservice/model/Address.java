package org.example.userservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table

public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Integer userId;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private boolean isDefault;

}
