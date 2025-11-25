package com.allconnect.integration.core;

import com.allconnect.integration.dto.ProviderConfig;
import java.util.List;

/**
 * Interface for managing provider configurations
 */
public interface IProviderRegistry {

    /**
     * Registers a new provider configuration
     */
    void register(String providerId, ProviderConfig config);

    /**
     * Unregisters a provider
     */
    void unregister(String providerId);

    /**
     * Gets configuration for a specific provider
     */
    ProviderConfig getConfig(String providerId);

    /**
     * Gets all registered providers
     */
    List<ProviderConfig> getAllProviders();

    /**
     * Gets providers by protocol type (REST, SOAP, GRPC)
     */
    List<ProviderConfig> getProvidersByType(String protocolType);
}
