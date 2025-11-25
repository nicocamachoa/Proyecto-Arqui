package com.allconnect.integration.dto;

import lombok.Data;

@Data
public class GenericCancelResponse {
    private boolean success;
    private String errorMessage;
}
