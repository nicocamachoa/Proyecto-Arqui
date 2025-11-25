package com.allconnect.integration.config;

import com.allconnect.integration.core.IProviderRegistry;
import com.allconnect.integration.dto.ProviderConfig;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "integration")
@Data
public class ProvidersConfig {

    private List<ProviderConfig> providers;
    private final IProviderRegistry providerRegistry;

    public ProvidersConfig(IProviderRegistry providerRegistry) {
        this.providerRegistry = providerRegistry;
    }

    @PostConstruct
    public void init() {
        if (providers != null) {
            providers.forEach(provider -> providerRegistry.register(provider.getId(), provider));
        }
    }
}
