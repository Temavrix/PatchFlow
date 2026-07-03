package com.example.patchflow;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.project-id}")
    private String projectId;

    @Value("${firebase.client-email}")
    private String clientEmail;

    @Value("${firebase.private-key}")
    private String privateKey;

    @Value("${firebase.private-key-id}")
    private String privateKeyId;

    @Value("${firebase.client-id}")
    private String clientId;

    @PostConstruct
    public void initialize() {

        try {
            Map<String, Object> serviceAccount = new HashMap<>();

            serviceAccount.put(
                "type",
                "service_account"
            );

            serviceAccount.put(
                "project_id",
                projectId
            );

            serviceAccount.put(
                "client_email",
                clientEmail
            );

            serviceAccount.put(
                "private_key_id",
                privateKeyId
            );

            serviceAccount.put(
                "client_id",
                clientId
            );

            serviceAccount.put(
                "private_key",
                privateKey.replace("\\n", "\n")
            );

            GoogleCredentials credentials =
                GoogleCredentials.fromStream(
                    new ByteArrayInputStream(
                        new ObjectMapper()
                            .writeValueAsBytes(
                                serviceAccount
                            )
                    )
                );

            FirebaseOptions options = FirebaseOptions.builder().setCredentials(credentials).build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}