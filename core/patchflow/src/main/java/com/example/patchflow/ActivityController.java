package com.example.patchflow;

import com.example.patchflow.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/activity")
@CrossOrigin(origins = "${app.frontend.url}")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping
    public ResponseEntity<?> createActivity(
            @RequestBody Activity activity) {

        activity.setId(UUID.randomUUID().toString());

        activityService.save(activity);

        System.out.println("Saved to Cosmos DB:");
        System.out.println(activity.getIssueTitle());

        return ResponseEntity.ok().build();
    }
}