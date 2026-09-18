package org.example.userservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.userservice.dto.UserRegisterDto;
import org.example.userservice.dto.UserResponseDto;
import org.example.userservice.model.Role;
import org.example.userservice.model.User;
import org.example.userservice.service.UserService;
import org.example.userservice.shareddto.ApiResponse;
import org.example.userservice.shareddto.LoginRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable spring security filters for controller unit testing
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User mockUser;
    private UserResponseDto mockResponseDto;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setEmail("testuser@gmail.com");
        mockUser.setRole(Role.CONSUMER);

        mockResponseDto = new UserResponseDto();
        mockResponseDto.setId(1L);
        mockResponseDto.setUsername("testuser");
        mockResponseDto.setEmail("testuser@gmail.com");
        mockResponseDto.setRole(Role.valueOf(Role.CONSUMER.name()));
    }

    @Test
    public void testCreateUser_Success() throws Exception {
        UserRegisterDto registerDto = new UserRegisterDto();
        registerDto.setUsername("testuser");
        registerDto.setEmail("testuser@gmail.com");
        registerDto.setPassword("password123");

        Mockito.when(userService.registerUser(any(UserRegisterDto.class))).thenReturn(mockUser);

        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User created successfully"))
                .andExpect(jsonPath("$.data.username").value("testuser"));
    }

    @Test
    public void testLogin_Success() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("testuser@gmail.com");
        loginRequest.setPassword("password123");

        ApiResponse expectedResponse = new ApiResponse(true, "Login successful", "mock-jwt-token");
        Mockito.when(userService.login(any(LoginRequest.class))).thenReturn(expectedResponse);

        mockMvc.perform(post("/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data").value("mock-jwt-token"));
    }

    @Test
    public void testGetProfile_Success() throws Exception {
        Mockito.when(userService.getProfileByEmail(any(String.class))).thenReturn(mockResponseDto);

        mockMvc.perform(get("/users/profile")
                .principal(() -> "testuser@gmail.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Profile retrieved successfully!"))
                .andExpect(jsonPath("$.data.email").value("testuser@gmail.com"));
    }

    @Test
    public void testUpdateProfile_Success() throws Exception {
        UserRegisterDto updateDto = new UserRegisterDto();
        updateDto.setFirstName("John");
        updateDto.setLastName("Doe");

        UserResponseDto updatedResponse = new UserResponseDto();
        updatedResponse.setId(1L);
        updatedResponse.setEmail("testuser@gmail.com");
        updatedResponse.setFirstName("John");
        updatedResponse.setLastName("Doe");

        Mockito.when(userService.updateProfile(any(String.class), any(UserRegisterDto.class))).thenReturn(updatedResponse);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/users/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto))
                .principal(() -> "testuser@gmail.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Profile updated successfully!"))
                .andExpect(jsonPath("$.data.firstName").value("John"))
                .andExpect(jsonPath("$.data.lastName").value("Doe"));
    }
}
