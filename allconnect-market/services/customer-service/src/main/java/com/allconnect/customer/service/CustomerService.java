package com.allconnect.customer.service;

import com.allconnect.customer.dto.*;
import com.allconnect.customer.model.*;
import com.allconnect.customer.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final WishlistRepository wishlistRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Customer operations
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return mapToCustomerResponse(customer);
    }

    public CustomerResponse getCustomerByEmail(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return mapToCustomerResponse(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(Long id, CustomerRequest request) {
        if (customerRepository.existsById(id)) {
            throw new RuntimeException("Customer already exists");
        }

        Customer customer = Customer.builder()
                .id(id)
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .profileImageUrl(request.getProfileImageUrl())
                .build();

        customer = customerRepository.save(customer);
        log.info("Customer created: {}", customer.getEmail());

        publishCustomerEvent("customer.created", customer);
        return mapToCustomerResponse(customer);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setPhone(request.getPhone());
        customer.setProfileImageUrl(request.getProfileImageUrl());

        customer = customerRepository.save(customer);
        log.info("Customer updated: {}", customer.getEmail());

        publishCustomerEvent("customer.updated", customer);
        return mapToCustomerResponse(customer);
    }

    // Address operations
    public List<AddressResponse> getAddresses(Long customerId) {
        return addressRepository.findByCustomerId(customerId).stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }

    public AddressResponse getDefaultAddress(Long customerId) {
        Address address = addressRepository.findByCustomerIdAndIsDefaultTrue(customerId)
                .orElseThrow(() -> new RuntimeException("No default address found"));
        return mapToAddressResponse(address);
    }

    @Transactional
    public AddressResponse addAddress(Long customerId, AddressRequest request) {
        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException("Customer not found");
        }

        // If this is the first address or marked as default, handle default logic
        if (request.getIsDefault()) {
            addressRepository.findByCustomerIdAndIsDefaultTrue(customerId)
                    .ifPresent(addr -> {
                        addr.setIsDefault(false);
                        addressRepository.save(addr);
                    });
        }

        Address address = Address.builder()
                .customerId(customerId)
                .street(request.getStreet())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .additionalInfo(request.getAdditionalInfo())
                .isDefault(request.getIsDefault())
                .addressType(request.getAddressType())
                .build();

        address = addressRepository.save(address);
        log.info("Address added for customer: {}", customerId);

        return mapToAddressResponse(address);
    }

    @Transactional
    public void deleteAddress(Long customerId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Address does not belong to customer");
        }

        addressRepository.delete(address);
        log.info("Address deleted: {} for customer: {}", addressId, customerId);
    }

    // Wishlist operations
    public List<WishlistItemResponse> getWishlist(Long customerId) {
        return wishlistRepository.findByCustomerId(customerId).stream()
                .map(this::mapToWishlistResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WishlistItemResponse addToWishlist(Long customerId, Long productId) {
        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException("Customer not found");
        }

        if (wishlistRepository.existsByCustomerIdAndProductId(customerId, productId)) {
            throw new RuntimeException("Product already in wishlist");
        }

        WishlistItem item = WishlistItem.builder()
                .customerId(customerId)
                .productId(productId)
                .build();

        item = wishlistRepository.save(item);
        log.info("Product {} added to wishlist for customer: {}", productId, customerId);

        return mapToWishlistResponse(item);
    }

    @Transactional
    public void removeFromWishlist(Long customerId, Long productId) {
        WishlistItem item = wishlistRepository.findByCustomerIdAndProductId(customerId, productId)
                .orElseThrow(() -> new RuntimeException("Product not in wishlist"));

        wishlistRepository.delete(item);
        log.info("Product {} removed from wishlist for customer: {}", productId, customerId);
    }

    // Mappers
    private CustomerResponse mapToCustomerResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .email(customer.getEmail())
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .phone(customer.getPhone())
                .profileImageUrl(customer.getProfileImageUrl())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }

    private AddressResponse mapToAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .customerId(address.getCustomerId())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zipCode(address.getZipCode())
                .country(address.getCountry())
                .additionalInfo(address.getAdditionalInfo())
                .isDefault(address.getIsDefault())
                .addressType(address.getAddressType())
                .createdAt(address.getCreatedAt())
                .build();
    }

    private WishlistItemResponse mapToWishlistResponse(WishlistItem item) {
        return WishlistItemResponse.builder()
                .id(item.getId())
                .customerId(item.getCustomerId())
                .productId(item.getProductId())
                .addedAt(item.getAddedAt())
                .build();
    }

    private void publishCustomerEvent(String eventType, Customer customer) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", eventType);
            event.put("customerId", customer.getId());
            event.put("email", customer.getEmail());
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("customer-events", event);
            log.info("Published event: {} for customer: {}", eventType, customer.getId());
        } catch (Exception e) {
            log.warn("Failed to publish Kafka event: {}", e.getMessage());
        }
    }
}
