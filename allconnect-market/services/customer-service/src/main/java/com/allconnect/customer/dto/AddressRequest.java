package com.allconnect.customer.dto;

import com.allconnect.customer.model.AddressType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    @NotBlank(message = "Street is required")
    private String street;

    @NotBlank(message = "City is required")
    private String city;

    private String state;

    @NotBlank(message = "Zip code is required")
    private String zipCode;

    @NotBlank(message = "Country is required")
    private String country;

    private String additionalInfo;

    private Boolean isDefault = false;

    private AddressType addressType = AddressType.SHIPPING;
}
