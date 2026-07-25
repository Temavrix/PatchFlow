package com.example.patchflow.config;

import com.azure.cosmos.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CosmosConfig {

    @Value("${spring.cloud.azure.cosmos.endpoint}")
    private String endpoint;

    @Value("${spring.cloud.azure.cosmos.key}")
    private String key;

    @Bean
    public CosmosClient cosmosClient() {
        return new CosmosClientBuilder()
                .endpoint(endpoint)
                .key(key)
                .gatewayMode()
                .buildClient();
    }
}