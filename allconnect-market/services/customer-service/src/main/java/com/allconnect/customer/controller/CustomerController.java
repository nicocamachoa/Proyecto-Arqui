package com.allconnect.customer.controller;

import com.allconnect.customer.dto.*;
import com.allconnect.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer Profile Management APIs")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping("/{id}")
    @Operation(summary = "Create customer profile")
    public ResponseEntity<CustomerResponse> createCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.createCustomer(id, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer profile")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    // Address endpoints
    @GetMapping("/{id}/addresses")
    @Operation(summary = "Get customer addresses")
    public ResponseEntity<List<AddressResponse>> getAddresses(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getAddresses(id));
    }

    @GetMapping("/{id}/addresses/default")
    @Operation(summary = "Get customer default address")
    public ResponseEntity<AddressResponse> getDefaultAddress(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getDefaultAddress(id));
    }

    @PostMapping("/{id}/addresses")
    @Operation(summary = "Add customer address")
    public ResponseEntity<AddressResponse> addAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(customerService.addAddress(id, request));
    }

    @DeleteMapping("/{id}/addresses/{addressId}")
    @Operation(summary = "Delete customer address")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long id,
            @PathVariable Long addressId) {
        customerService.deleteAddress(id, addressId);
        return ResponseEntity.noContent().build();
    }

    // Wishlist endpoints
    @GetMapping("/{id}/wishlist")
    @Operation(summary = "Get customer wishlist")
    public ResponseEntity<List<WishlistItemResponse>> getWishlist(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getWishlist(id));
    }

    @PostMapping("/{id}/wishlist")
    @Operation(summary = "Add product to wishlist")
    public ResponseEntity<WishlistItemResponse> addToWishlist(
            @PathVariable Long id,
            @RequestParam Long productId) {
        return ResponseEntity.ok(customerService.addToWishlist(id, productId));
    }

    @DeleteMapping("/{id}/wishlist/{productId}")
    @Operation(summary = "Remove product from wishlist")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long id,
            @PathVariable Long productId) {
        customerService.removeFromWishlist(id, productId);
        return ResponseEntity.noContent().build();
    }
}
