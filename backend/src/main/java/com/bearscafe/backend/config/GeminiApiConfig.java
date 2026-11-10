
package com.bearscafe.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class GeminiApiConfig {

    @Bean("geminiRestClient")
    public RestClient geminiRestClient(
            @Value("${gemini.api.base-url}") String baseUrl) {

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(
                    new org.springframework.http.client
                        .SimpleClientHttpRequestFactory() {{
                            setConnectTimeout(Duration.ofSeconds(10));
                            setReadTimeout(Duration.ofSeconds(45));
                        }}
                )
                .build();
    }
}