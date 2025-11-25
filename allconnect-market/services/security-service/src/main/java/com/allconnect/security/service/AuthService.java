package com.allconnect.security.service;

import com.allconnect.security.dto.*;
import com.allconnect.security.model.Role;
import com.allconnect.security.model.User;
import com.allconnect.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(request.getRole() != null ? request.getRole() : Role.CUSTOMER)
                .active(true)
                .build();

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        String token = jwtService.generateToken(user);

        // Publish event to Kafka
        publishUserEvent("user.registered", user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .expiresIn(jwtService.getExpirationTime())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.getActive()) {
            throw new RuntimeException("User account is deactivated");
        }

        String token = jwtService.generateToken(user);
        log.info("User logged in successfully: {}", user.getEmail());

        // Publish event to Kafka
        publishUserEvent("user.logged_in", user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .expiresIn(jwtService.getExpirationTime())
                .build();
    }

    public TokenValidationResponse validateToken(String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            if (!jwtService.isTokenValid(token)) {
                return TokenValidationResponse.builder()
                        .valid(false)
                        .message("Token is invalid or expired")
                        .build();
            }

            String email = jwtService.extractEmail(token);
            Long userId = jwtService.extractUserId(token);
            String roleStr = jwtService.extractRole(token);

            return TokenValidationResponse.builder()
                    .valid(true)
                    .userId(userId)
                    .email(email)
                    .role(Role.valueOf(roleStr))
                    .message("Token is valid")
                    .build();
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage());
            return TokenValidationResponse.builder()
                    .valid(false)
                    .message("Token validation failed: " + e.getMessage())
                    .build();
        }
    }

    public UserResponse getCurrentUser(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private void publishUserEvent(String eventType, User user) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", eventType);
            event.put("userId", user.getId());
            event.put("email", user.getEmail());
            event.put("firstName", user.getFirstName());
            event.put("lastName", user.getLastName());
            event.put("role", user.getRole().name());
            event.put("timestamp", System.currentTimeMillis());

            kafkaTemplate.send("user-events", event);
            log.info("Published event: {} for user: {}", eventType, user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to publish Kafka event: {}", e.getMessage());
        }
    }
}
