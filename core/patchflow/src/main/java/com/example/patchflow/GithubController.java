package com.example.patchflow;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.cloud.firestore.DocumentSnapshot;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;

import java.util.Date;


@RestController
@RequestMapping("/api/github")
@CrossOrigin(origins = "${app.frontend.url}")
public class GithubController {

    @Value("${github.client.id}")
    private String githubClientId;

    @Value("${github.client.secret}")
    private String githubClientSecret;

    @GetMapping("/client-id")
    public Map<String, String> getClientId() {
        return Map.of( "clientId", githubClientId
        );
    }

    @PostMapping("/exchange")
    public ResponseEntity<?> exchange(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody Map<String, String> body)
        throws Exception {

        String firebaseJwt =
            authHeader.replace("Bearer ", "");

        FirebaseToken decodedToken =
            FirebaseAuth.getInstance()
                .verifyIdToken(firebaseJwt);

        String userId = decodedToken.getUid();

        String code = body.get("code");

        String form =
            "client_id=" + githubClientId +
            "&client_secret=" + githubClientSecret +
            "&code=" + code;

        HttpClient client =
            HttpClient.newHttpClient();

        HttpRequest request =
            HttpRequest.newBuilder()
                .uri(URI.create(
                    "https://github.com/login/oauth/access_token"))
                .header(
                    "Content-Type",
                    "application/x-www-form-urlencoded")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .build();

        HttpResponse<String> response = client.send(request,HttpResponse.BodyHandlers.ofString());

        JsonObject tokenResponse = JsonParser.parseString(response.body()).getAsJsonObject();

        String githubAccessToken = tokenResponse.get("access_token").getAsString();

        Firestore firestore = FirestoreClient.getFirestore();

        Map<String, Object> githubData = Map.of(
                "accessToken", githubAccessToken,
                "connectedAt", new Date()
            );

        firestore.collection("githubIntegrations").document(userId).set(githubData);

        return ResponseEntity.ok(
            Map.of("connected", true)
        );
    }

    @GetMapping("/repos")
    public ResponseEntity<?> getRepos(
        @RequestHeader("Authorization")
        String authHeader
    ) throws Exception {

        String firebaseJwt = authHeader.replace("Bearer ", "");

        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(firebaseJwt);

        String userId = decodedToken.getUid();

        Firestore firestore = FirestoreClient.getFirestore();

        DocumentSnapshot document = firestore
                .collection("githubIntegrations")
                .document(userId)
                .get()
                .get();

        if (!document.exists()) {
            return ResponseEntity.badRequest().body("GitHub not connected");
        }

        String githubAccessToken = document.getString("accessToken");

        if (githubAccessToken == null) {
            return ResponseEntity.badRequest()
                .body("GitHub not connected");
        }

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.github.com/user/repos"))
                        .header(
                            "Authorization",
                            "Bearer " + githubAccessToken)
                        .header(
                            "Accept",
                            "application/vnd.github+json")
                        .build();

        HttpResponse<String> response = client.send(request,HttpResponse.BodyHandlers.ofString());
        return ResponseEntity.ok(response.body());
    }


    @GetMapping("/issues")
    public ResponseEntity<?> getIssues(
        @RequestHeader("Authorization")
        String authHeader,
        @RequestParam String owner,
        @RequestParam String repo
    ) throws Exception {

        String firebaseJwt = authHeader.replace("Bearer ", "");

        FirebaseToken decodedToken = FirebaseAuth.getInstance()
                .verifyIdToken(firebaseJwt);

        String userId = decodedToken.getUid();

        Firestore firestore = FirestoreClient.getFirestore();

        DocumentSnapshot document = firestore
                .collection("githubIntegrations")
                .document(userId)
                .get()
                .get();

        if (!document.exists()) {
            return ResponseEntity.badRequest()
                .body("GitHub not connected");
        }

        String githubAccessToken =
            document.getString("accessToken");

        if (githubAccessToken == null) {return ResponseEntity.badRequest().body("GitHub not connected");}

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(
                            "https://api.github.com/repos/"
                            + owner + "/"
                            + repo + "/issues"))
                        .header(
                            "Authorization",
                            "Bearer " + githubAccessToken)
                        .header(
                            "Accept",
                            "application/vnd.github+json")
                        .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        return ResponseEntity.ok(response.body());
    }
}