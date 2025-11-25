package com.allconnect.integration.factory;

import com.allconnect.integration.core.IProviderAdapter;
import com.allconnect.integration.core.IProviderRegistry;
import com.allconnect.integration.dto.ProviderConfig;
import com.allconnect.integration.exception.UnsupportedProtocolException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AdapterFactory {

    private final Map<String, IProviderAdapter> adapters = new HashMap<>();
    private final IProviderRegistry providerRegistry;

    @Autowired
    public AdapterFactory(List<IProviderAdapter> adapterList, IProviderRegistry providerRegistry) {
        this.providerRegistry = providerRegistry;
        // Auto-register all available adapters
        adapterList.forEach(adapter ->
            adapters.put(adapter.getProviderType().toUpperCase(), adapter));
    }

    /**
     * Gets an adapter by protocol type
     */
    public IProviderAdapter getAdapter(String protocolType) {
        IProviderAdapter adapter = adapters.get(protocolType.toUpperCase());
        if (adapter == null) {
            throw new UnsupportedProtocolException("No adapter found for protocol: " + protocolType);
        }
        return adapter;
    }

    /**
     * Gets an adapter for a specific provider using its configuration
     */
    public IProviderAdapter getAdapterForProvider(String providerId) {
        ProviderConfig config = providerRegistry.getConfig(providerId);
        return getAdapter(config.getProtocol());
    }

    /**
     * Returns available protocol types
     */
    public List<String> getAvailableProtocols() {
        return adapters.keySet().stream().toList();
    }
}
