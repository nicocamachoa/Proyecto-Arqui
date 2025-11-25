package com.allconnect.integration.registry;

import com.allconnect.integration.core.IProviderRegistry;
import com.allconnect.integration.dto.ProviderConfig;
import com.allconnect.integration.exception.ProviderNotFoundException;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class ProviderRegistry implements IProviderRegistry {

    private final Map<String, ProviderConfig> providers = new ConcurrentHashMap<>();

    @Override
    public void register(String providerId, ProviderConfig config) {
        providers.put(providerId, config);
    }

    @Override
    public void unregister(String providerId) {
        providers.remove(providerId);
    }

    @Override
    public ProviderConfig getConfig(String providerId) {
        ProviderConfig config = providers.get(providerId);
        if (config == null) {
            throw new ProviderNotFoundException("Provider not found: " + providerId);
        }
        return config;
    }

    @Override
    public List<ProviderConfig> getAllProviders() {
        return providers.values().stream()
            .filter(ProviderConfig::isEnabled)
            .collect(Collectors.toList());
    }

    @Override
    public List<ProviderConfig> getProvidersByType(String protocolType) {
        return providers.values().stream()
            .filter(p -> p.isEnabled() && p.getProtocol().equalsIgnoreCase(protocolType))
            .collect(Collectors.toList());
    }
}
