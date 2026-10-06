package com.rentcar.dto;

import java.util.HashMap;
import java.util.Map;

public class AuthResponse {
    private boolean success = true;
    private String message;
    private String token;
    private UserDTO user;
    private Map<String, Object> data;

    public AuthResponse() {
    }

    public AuthResponse(String message, String token, UserDTO user) {
        this.success = true;
        this.message = message;
        this.token = token;
        this.user = user;
        Map<String, Object> payload = new HashMap<>();
        payload.put("token", token);
        payload.put("user", user);
        this.data = payload;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
