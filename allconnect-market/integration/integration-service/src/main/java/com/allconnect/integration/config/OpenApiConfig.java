package com.allconnect.integration.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI integrationServiceOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("AllConnect Integration Service API")
                .description("""
                    Multi-protocol Integration Service for AllConnect Market.

                    This service acts as a facade that connects to external providers using different protocols:
                    - **REST Provider** (port 4001): Physical products and orders
                    - **SOAP Provider** (port 4002): Professional services and bookings
                    - **gRPC Provider** (port 4003): Digital subscriptions

                    All endpoints use HTTP/JSON for easy consumption while the underlying adapters
                    handle protocol translation to the appropriate provider.
                    """)
                .version("1.0.0")
                .contact(new Contact()
                    .name("AllConnect Team")
                    .email("team@allconnect.com"))
                .license(new License()
                    .name("MIT License")
                    .url("https://opensource.org/licenses/MIT")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:8085")
                    .description("Local development server")
            ));
    }
}
