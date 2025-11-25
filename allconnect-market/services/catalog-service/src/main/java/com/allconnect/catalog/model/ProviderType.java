package com.allconnect.catalog.model;

public enum ProviderType {
    REST,   // Proveedor con API REST (productos físicos)
    SOAP,   // Proveedor con API SOAP (servicios legacy)
    GRPC    // Proveedor con gRPC (suscripciones digitales)
}
