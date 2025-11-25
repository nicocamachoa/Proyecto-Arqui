package com.allconnect.integration.dto;

import lombok.Data;

@Data
public class GenericAddress {
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
}
