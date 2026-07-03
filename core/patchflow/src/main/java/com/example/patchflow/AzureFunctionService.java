package com.example.patchflow;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

@Service
public class AzureFunctionService {

   @Value("${azure.function.url}")
    private String FUNCTION_URL;

    private final RestTemplate restTemplate = new RestTemplate();

    public String sendPrompt(String prompt) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String json =
            "{\"prompt\":\"" +
            prompt.replace("\"", "\\\"") +
            "\"}";

        HttpEntity<String> request =
            new HttpEntity<>(json, headers);

        return restTemplate.postForObject(
            FUNCTION_URL,
            request,
            String.class
        );
    }
}