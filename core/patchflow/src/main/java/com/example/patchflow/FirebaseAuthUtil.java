package com.example.patchflow;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

public class FirebaseAuthUtil {

    public static String getUid(String authHeader)
            throws Exception {

        String token =
            authHeader.replace("Bearer ", "");

        FirebaseToken decodedToken =
            FirebaseAuth.getInstance()
                .verifyIdToken(token);

        return decodedToken.getUid();
    }
}