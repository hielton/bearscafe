
package com.bearscafe.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class UsdaApiConfig {

    @Bean
    public RestClient usdaRestClient(
            RestClient.Builder builder,
            @Value("${usda.api.base-url}") String baseUrl
    ) {
        return builder
                .baseUrl(baseUrl)
                .build();
    }
}