package com.example.patchflow.service;

import com.azure.cosmos.*;
import com.example.patchflow.Activity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ActivityService {

    private final CosmosContainer container;

    public ActivityService(
            CosmosClient cosmosClient,
            @Value("${spring.cloud.azure.cosmos.database}") String databaseName) {

        CosmosDatabase database = cosmosClient.getDatabase(databaseName);

        this.container = database.getContainer("Activities");
    }

    public void save(Activity activity) {
        container.createItem(activity);
    }
}