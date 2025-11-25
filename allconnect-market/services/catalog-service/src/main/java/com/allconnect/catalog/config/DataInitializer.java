package com.allconnect.catalog.config;

import com.allconnect.catalog.model.*;
import com.allconnect.catalog.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            log.info("Initializing categories and products...");
            initializeCategories();
            initializeProducts();
            log.info("Sample data created successfully!");
        }
    }

    private void initializeCategories() {
        categoryRepository.save(Category.builder()
                .name("Electrónica")
                .description("Dispositivos electrónicos y gadgets")
                .active(true)
                .build());

        categoryRepository.save(Category.builder()
                .name("Ropa y Accesorios")
                .description("Moda y accesorios")
                .active(true)
                .build());

        categoryRepository.save(Category.builder()
                .name("Salud y Bienestar")
                .description("Servicios de salud y bienestar")
                .active(true)
                .build());

        categoryRepository.save(Category.builder()
                .name("Servicios Profesionales")
                .description("Consultorías y servicios profesionales")
                .active(true)
                .build());

        categoryRepository.save(Category.builder()
                .name("Entretenimiento Digital")
                .description("Streaming y contenido digital")
                .active(true)
                .build());

        categoryRepository.save(Category.builder()
                .name("Educación")
                .description("Cursos y contenido educativo")
                .active(true)
                .build());
    }

    private void initializeProducts() {
        // PHYSICAL products (REST provider)
        productRepository.save(Product.builder()
                .name("Laptop Gaming XPS")
                .description("Laptop de alto rendimiento para gaming con RTX 4080, 32GB RAM, 1TB SSD")
                .price(new BigDecimal("4999000"))
                .type(ProductType.PHYSICAL)
                .categoryId(1L)
                .providerType(ProviderType.REST)
                .providerProductId("PHYS-001")
                .stock(50)
                .imageUrl("https://images.unsplash.com/photo-1603302576837-37561b2e2302")
                .brand("Dell")
                .sku("LAPTOP-XPS-001")
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Smartphone Galaxy S24 Ultra")
                .description("Smartphone premium con cámara de 200MP y S Pen incluido")
                .price(new BigDecimal("5499000"))
                .type(ProductType.PHYSICAL)
                .categoryId(1L)
                .providerType(ProviderType.REST)
                .providerProductId("PHYS-002")
                .stock(100)
                .imageUrl("https://images.unsplash.com/photo-1610945265064-0e34e5519bbf")
                .brand("Samsung")
                .sku("PHONE-S24-001")
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Audífonos Bluetooth Pro")
                .description("Audífonos inalámbricos con cancelación de ruido activa")
                .price(new BigDecimal("899000"))
                .type(ProductType.PHYSICAL)
                .categoryId(1L)
                .providerType(ProviderType.REST)
                .providerProductId("PHYS-003")
                .stock(200)
                .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e")
                .brand("Sony")
                .sku("AUDIO-BT-001")
                .active(true)
                .build());

        // SERVICE products (SOAP provider)
        productRepository.save(Product.builder()
                .name("Consulta Médica General")
                .description("Consulta médica general con especialista certificado")
                .price(new BigDecimal("150000"))
                .type(ProductType.SERVICE)
                .categoryId(3L)
                .providerType(ProviderType.SOAP)
                .providerProductId("SERV-001")
                .durationMinutes(30)
                .imageUrl("https://images.unsplash.com/photo-1631217868264-e5b90bb7e133")
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Asesoría Legal 1 Hora")
                .description("Asesoría legal con abogado especializado")
                .price(new BigDecimal("250000"))
                .type(ProductType.SERVICE)
                .categoryId(4L)
                .providerType(ProviderType.SOAP)
                .providerProductId("SERV-002")
                .durationMinutes(60)
                .imageUrl("https://images.unsplash.com/photo-1589829545856-d10d557cf95f")
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Clase de Yoga Personal")
                .description("Sesión personalizada de yoga con instructor certificado")
                .price(new BigDecimal("80000"))
                .type(ProductType.SERVICE)
                .categoryId(3L)
                .providerType(ProviderType.SOAP)
                .providerProductId("SERV-003")
                .durationMinutes(60)
                .imageUrl("https://images.unsplash.com/photo-1544367567-0f2fcb009e0b")
                .active(true)
                .build());

        // SUBSCRIPTION products (gRPC provider)
        productRepository.save(Product.builder()
                .name("Plan Streaming Premium")
                .description("Acceso ilimitado a películas, series y documentales en 4K")
                .price(new BigDecimal("49900"))
                .type(ProductType.SUBSCRIPTION)
                .categoryId(5L)
                .providerType(ProviderType.GRPC)
                .providerProductId("SUBS-001")
                .billingPeriod("MONTHLY")
                .imageUrl("https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37")
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Software Productividad Pro")
                .description("Suite completa de herramientas de productividad en la nube")
                .price(new BigDecimal("99900"))
                .type(ProductType.SUBSCRIPTION)
                .categoryId(5L)
                .providerType(ProviderType.GRPC)
                .providerProductId("SUBS-002")
                .billingPeriod("MONTHLY")
                .imageUrl("https://images.unsplash.com/photo-1551288049-bebda4e38f71")
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Contenido Educativo Ilimitado")
                .description("Acceso a más de 10,000 cursos y certificaciones")
                .price(new BigDecimal("299900"))
                .type(ProductType.SUBSCRIPTION)
                .categoryId(6L)
                .providerType(ProviderType.GRPC)
                .providerProductId("SUBS-003")
                .billingPeriod("YEARLY")
                .imageUrl("https://images.unsplash.com/photo-1501504905252-473c47e087f8")
                .active(true)
                .build());
    }
}
