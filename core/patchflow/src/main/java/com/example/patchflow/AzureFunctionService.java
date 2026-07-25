package com.example.patchflow;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import com.google.gson.JsonObject;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

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


    @Value("${azure.function.pulse.url}")
    private String functionUrl;

    public String getProjectPulse(String projectId,String projectName,String description) throws Exception {

        JsonObject body = new JsonObject();
        body.addProperty("projectId", projectId);
        body.addProperty("projectName", projectName);
        body.addProperty("description", description);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(functionUrl))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
            .build();

        HttpClient client = HttpClient.newHttpClient();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        return response.body();
    }
}