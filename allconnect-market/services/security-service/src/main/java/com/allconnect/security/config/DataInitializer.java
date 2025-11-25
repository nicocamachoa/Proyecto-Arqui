package com.allconnect.security.config;

import com.allconnect.security.model.Role;
import com.allconnect.security.model.User;
import com.allconnect.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Initializing test users...");

            // Customer user
            userRepository.save(User.builder()
                    .email("cliente@test.com")
                    .password(passwordEncoder.encode("password123"))
                    .firstName("Cliente")
                    .lastName("Test")
                    .phone("+57 300 123 4567")
                    .role(Role.CUSTOMER)
                    .active(true)
                    .build());

            // Admin Negocio
            userRepository.save(User.builder()
                    .email("admin.negocio@test.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("Negocio")
                    .role(Role.ADMIN_NEGOCIO)
                    .active(true)
                    .build());

            // Admin Contenido
            userRepository.save(User.builder()
                    .email("admin.contenido@test.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("Contenido")
                    .role(Role.ADMIN_CONTENIDO)
                    .active(true)
                    .build());

            // Admin IT
            userRepository.save(User.builder()
                    .email("admin.it@test.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("IT")
                    .role(Role.ADMIN_IT)
                    .active(true)
                    .build());

            // Admin Operaciones
            userRepository.save(User.builder()
                    .email("admin.operaciones@test.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("Operaciones")
                    .role(Role.ADMIN_OPERACIONES)
                    .active(true)
                    .build());

            log.info("Test users created successfully!");
        }
    }
}
