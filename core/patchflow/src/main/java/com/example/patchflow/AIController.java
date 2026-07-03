package com.example.patchflow;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;


@RestController
@CrossOrigin(origins = "${app.frontend.url}")
public class AIController {
    private static final String MODEL = "gemini-2.5-flash";
    private static final String MODELNEW = "gemini-3.5-flash";
    private static final String ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
    //private static final String ENDPOINTTHREE = "https://generativelanguage.googleapis.com/v1beta/models/"+ MODELNEW + ":generateContent?key=" + "${frontend.gemini}";

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.frontend.gemini}")
    private String geminiApiKey;

    @Value("${app.frontend.openapi}")
    private String OPEN_API_KEY;

    @Autowired
    private AzureFunctionService azureFunctionService;

    public String sendPromptTwoFlash(String prompt) throws Exception {

        String ENDPOINTTWO =
        "https://generativelanguage.googleapis.com/v1beta/models/"
        + MODEL
        + ":generateContent?key="
        + geminiApiKey;

        JsonObject textPart = new JsonObject();
        textPart.addProperty("text", prompt);

        JsonArray parts = new JsonArray();
        parts.add(textPart);

        JsonObject content = new JsonObject();
        content.add("parts", parts);

        JsonArray contents = new JsonArray();
        contents.add(content);

        JsonObject body = new JsonObject();
        body.add("contents", contents);

        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(ENDPOINTTWO)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body.toString())).build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();

        if (!jsonResponse.has("candidates")) {
            return "API Error: " + jsonResponse;
        }
        JsonArray candidates = jsonResponse.getAsJsonArray("candidates");
        return candidates.get(0).getAsJsonObject()
                .getAsJsonObject("content")
                .getAsJsonArray("parts")
                .get(0).getAsJsonObject()
                .get("text").getAsString();
    }



    //currently depereciated and moved to azure
    public String sendPromptGemmafour(String prompt) throws Exception {
        // Create simple user message (OpenRouter format)
        JsonObject message = new JsonObject();
        message.addProperty("role", "user");
        message.addProperty("content", prompt);
    
        JsonArray messages = new JsonArray();
        messages.add(message);
    
        // Create request body
        JsonObject body = new JsonObject();
        body.addProperty("model", "google/gemma-4-31b-it:free");
        body.add("messages", messages);
        body.addProperty("max_tokens", 300);
        body.addProperty("temperature", 0.5);
    
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
    
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(ENDPOINT))
                .header("Authorization", "Bearer " + OPEN_API_KEY)
                .header("Content-Type", "application/json")
                .header("HTTP-Referer", "http://localhost")
                .header("X-Title", "MyJavaApp") // Optional
                .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                .build();
    
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
    
        JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();
    
        if (!jsonResponse.has("choices")) {
            return "API Error:\n" + jsonResponse;
        }
        return jsonResponse
                .getAsJsonArray("choices")
                .get(0).getAsJsonObject()
                .getAsJsonObject("message")
                .get("content").getAsString();
    }



    @PostMapping("/api/message")
    public String receiveMessage(
        @RequestBody MessageRequest request) throws Exception{
    
            try{
                String prompt = """
                Just Give me a simple 5 line description of the following issue:

                Issue Title: %s

                Please do not regugitate what I have just told like 'Here's a simple 5-line description:' 
                and just give me the description
                """.formatted(request.getMessage());

                return sendPromptTwoFlash(prompt);

            } catch (Exception e) {
                e.printStackTrace();
                return "Error: " + e.getMessage();
            }
    }


    @PostMapping("/api/analyze-project")
    public String analyzeProject(@RequestBody AnalyzeProjectRequest request) throws Exception{

        String projectData = request.getProject().toString();
        String issuesData = request.getIssues().toString();
    
        try{
            String prompt = """
            Analyze the project and all related issues.

            Use these rules:

            - Urgent > High > Medium > Low priority
            - Todo issues are more urgent than Code Review issues
            - Issues blocking multiple other issues should be prioritized
            - Consider both priority and status

            Provide:

            PROJECT HEALTH:
            - On Track / At Risk / Off Track

            TOP ISSUES TO FIX FIRST:
            1.
            2.
            3.
            4.
            5.

            RISKS:
            -

            RECOMMENDATIONS:
            -

            Project:
            %s

            Issues:
            %s
            Please do not regugitate what I have told and a short explaination is enough.
            """.formatted(projectData, issuesData);

            return azureFunctionService.sendPrompt(prompt);

        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}