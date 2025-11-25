package com.allconnect.customer.controller;

import com.allconnect.customer.dto.*;
import com.allconnect.customer.model.*;
import com.allconnect.customer.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin Customer APIs")
@Slf4j
public class AdminController {

    private final CustomerRepository customerRepository;

    @GetMapping("/customers")
    @Operation(summary = "Get all customers for admin")
    public ResponseEntity<List<AdminCustomerResponse>> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();

        List<AdminCustomerResponse> response = customers.stream()
                .map(this::mapToAdminCustomerResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/customers/{id}")
    @Operation(summary = "Get customer by ID for admin")
    public ResponseEntity<AdminCustomerResponse> getCustomerById(@PathVariable Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        return ResponseEntity.ok(mapToAdminCustomerResponse(customer));
    }

    private AdminCustomerResponse mapToAdminCustomerResponse(Customer customer) {
        // Note: ordersCount, totalSpent, and lastOrderAt would ideally come from
        // order-service. For now, we return placeholder values.
        // In a real implementation, you might use an API call to order-service
        // or maintain denormalized data in customer-service.

        return AdminCustomerResponse.builder()
                .id(customer.getId())
                .userId(customer.getId())
                .email(customer.getEmail())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .phone(customer.getPhone())
                .ordersCount(0) // Would be fetched from order-service
                .totalSpent(BigDecimal.ZERO) // Would be fetched from order-service
                .createdAt(customer.getCreatedAt())
                .lastOrderAt(null) // Would be fetched from order-service
                .build();
    }
}
