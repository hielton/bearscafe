
package com.bearscafe.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class UsdaApiConfig {

    @Bean("usdaRestClient")
    public RestClient usdaRestClient(
            @Value("${usda.api.base-url}") String baseUrl
    ) {

        return RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
}