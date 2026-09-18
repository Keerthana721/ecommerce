package org.example.userservice.controller;


import lombok.extern.slf4j.Slf4j;
import org.example.userservice.dto.UserRegisterDto;
import org.example.userservice.dto.UserResponseDto;
import org.example.userservice.dto.VerifyCodeRequest;
import org.example.userservice.model.Role;
import org.example.userservice.model.User;
import org.example.userservice.service.UserService;
import org.example.userservice.shareddto.ApiResponse;
import org.example.userservice.shareddto.LoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

//    @PostMapping("/admin-login")
//    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest request) {
//        return ResponseEntity.ok(userService.adminLogin(request));
//    }

    @PostMapping("/send-verification-code/{email}")
    public ResponseEntity<?> sendVerificationCode(@PathVariable String email) {
        try {
            String code = userService.sendVerificationCode(email);
            return ResponseEntity.ok(new ApiResponse(true, "Verification code sent successfully", code));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody VerifyCodeRequest request) {
        try {
            boolean verified = userService.verifyCode(request.getEmail(), request.getCode());
            return ResponseEntity.ok(new ApiResponse(true, "Email verified successfully", verified));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createUser(@RequestBody UserRegisterDto userDto) {

        try {
            User user = userService.registerUser(userDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse(true, "User registered successfully.", user));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, e.getMessage()));

        } catch (Exception e) {
            log.error("Registration failed: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(false, "Failed to register user: " + e.getMessage()));
        }
    }

    @GetMapping
//    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserResponseDto> users = userService.getAllUsers();
            log.info("Fetching all users");
            return ResponseEntity.ok(new ApiResponse(true, "Users retrieved successfully!", users));
        } catch (Exception e) {
            log.error("Error fetching users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{id:[0-9]+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','CONSUMER')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserResponseDto user = userService.convertToDto(userService.getUserById(id));
            log.info("Fetching user with id: {}", id);
            return ResponseEntity.ok(new ApiResponse(true, "User retrieved successfully!", user));
        } catch (Exception e) {
            log.error("Error fetching user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/search/{username}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','CONSUMER')")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
            UserResponseDto user = userService.convertToDto(userService.getUserByUsername(username));
            log.info("Fetching user with username: {}", username);
            return ResponseEntity.ok(new ApiResponse(true, "User retrieved successfully!", user));
        } catch (Exception e) {
            log.error("Error fetching user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> getUsersByRole(@PathVariable Role role) {
        try {
            List<UserResponseDto> users = userService.getUsersByRole(role);
            log.info("Fetching users with role: {}", role);
            return ResponseEntity.ok(new ApiResponse(true, "Users retrieved successfully!", users));
        } catch (Exception e) {
            log.error("Error fetching users by role: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER','CONSUMER')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserRegisterDto updateDto) {
        try {
            UserResponseDto updatedUser = userService.updateUser(id, updateDto);
            log.info("User updated with id: {}", id);
            return ResponseEntity.ok(new ApiResponse(true, "User updated successfully!", updatedUser));
        } catch (Exception e) {
            log.error("Error updating user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id:[0-9]+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            log.info("User deleted with id: {}", id);
            return ResponseEntity.ok(new ApiResponse(true, "User deleted successfully!"));
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = (String) authentication.getPrincipal();
            UserResponseDto user = userService.getProfileByEmail(email);
            log.info("Fetching profile for user: {}", email);
            return ResponseEntity.ok(new ApiResponse(true, "Profile retrieved successfully!", user));
        } catch (Exception e) {
            log.error("Error fetching profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserRegisterDto updateDto) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = (String) authentication.getPrincipal();
            UserResponseDto updatedUser = userService.updateProfile(email, updateDto);
            log.info("Profile updated for user: {}", email);
            return ResponseEntity.ok(new ApiResponse(true, "Profile updated successfully!", updatedUser));
        } catch (Exception e) {
            log.error("Error updating profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/internal/email")
    public ResponseEntity<?> getEmailByUserId(@RequestParam Long userId) {
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(new ApiResponse(true, "Email retrieved", user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, e.getMessage()));
        }
    }



}