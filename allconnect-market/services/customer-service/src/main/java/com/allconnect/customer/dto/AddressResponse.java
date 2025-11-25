package com.allconnect.customer.dto;

import com.allconnect.customer.model.AddressType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {

    private Long id;
    private Long customerId;
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String additionalInfo;
    private Boolean isDefault;
    private AddressType addressType;
    private LocalDateTime createdAt;
}
