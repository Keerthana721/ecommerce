package org.example.userservice.service;


import io.jsonwebtoken.Jwts;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.example.userservice.dto.UserRegisterDto;
import org.example.userservice.dto.UserResponseDto;
import org.example.userservice.model.Role;
import org.example.userservice.model.User;
import org.example.userservice.repository.UserRepository;
import org.example.userservice.security.JwtService;
import org.example.userservice.shareddto.LoginRequest;
import org.example.userservice.shareddto.LoginResponse;
import org.example.userservice.client.NotificationClient;
import org.example.userservice.shareddto.EmailSendRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private NotificationClient notificationClient;

    public User registerUser(UserRegisterDto dto) {
//        if (userRepository.existsByUsername(dto.getUsername())) {
//            throw new RuntimeException("Username already exists!");
//        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already exists!");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setRole(dto.getRole());
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());

        log.info("Registering user: {}", dto.getUsername());
        return userRepository.save(user);
    }

    public String sendVerificationCode(String email) {
        System.out.println("email = " + email);
        User user = userRepository.findByEmail(email)

                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        System.out.println("user = " + user);

        String code = String.valueOf((int) ((Math.random() * 900000) + 100000)); // 6 digit OTP
        user.setVerificationCode(code);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        System.out.println("user = " + user);
        try {
            EmailSendRequest request = EmailSendRequest.builder()
                    .toEmail(email)
                    .subject("E-Commerce Account Verification Code")
                    .body("Hello,\n\nYour account verification code is: " + code + "\n\nThis code expires in 15 minutes.\n\nThank you!")
                    .build();
            notificationClient.sendEmail(request);
            log.info("Verification code sent via Feign client to NotificationService: {}", email);
        } catch (Exception e) {
            log.warn("Failed to call NotificationService Feign client, falling back to local sender: {}", e.getMessage());
            emailService.sendVerificationCode(email, code);
        }
        System.out.println("user");

        log.info("Verification code generated and processed for {}: {}", email, code);
        return code;
    }

    public boolean verifyCode(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new RuntimeException("Invalid verification code");
        }

        if (user.getVerificationCodeExpiry() != null && user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired");
        }

        user.setIsEmailVerified(true);
        user.setVerificationCode(null);
        userRepository.save(user);
        log.info("Email verified successfully for: {}", email);
        return true;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public UserResponseDto updateUser(Long id, UserRegisterDto dto) {
        User user = getUserById(id);

        if (!user.getUsername().equals(dto.getUsername()) && userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Username already exists!");
        }

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setUpdatedAt(LocalDateTime.now());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        User updatedUser = userRepository.save(user);
        log.info("User updated: {}", id);
        return convertToDto(updatedUser);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("User deleted: {}", id);
    }

    public List<UserResponseDto> getUsersByRole(Role role) {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() == role && u.getIsActive())
                .collect(Collectors.toList());
        return users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public UserResponseDto convertToDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }


    public UserResponseDto createUser(UserRegisterDto dto) {

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());

        // Encrypt password
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        user.setRole(dto.getRole());

        User savedUser = userRepository.save(user);

        UserResponseDto response = new UserResponseDto();
        response.setId(savedUser.getId());
        response.setUsername(savedUser.getUsername());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setFirstName(savedUser.getFirstName());
        response.setLastName(savedUser.getLastName());
        response.setCreatedAt(LocalDateTime.now());
        response.setIsActive(Boolean.valueOf("true"));


        return response;
    }


    public LoginResponse login(LoginRequest request) {
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseGet(() -> userRepository.findByUsername(request.getEmail())
                            .orElseThrow(() -> new RuntimeException("User not found")));
            if (!passwordEncoder.matches(
                    request.getPassword(),
                    user.getPassword())) {

                throw new RuntimeException("Invalid password");
            }
            System.out.println("user.getPassword() = " + user.getPassword());
            System.out.println("request.getPassword() = " + request.getPassword());
            String token = jwtService.generateToken(user);
            String roleName = user.getRole() != null ? user.getRole().name() : "CONSUMER";

            return new LoginResponse(Math.toIntExact(user.getId()),
                    token,
                    "Login Successful",
                    true,
                    roleName,
                    user.getEmail(),
                    user.getUsername()
            );
        } catch (Exception e) {
            return new LoginResponse(Integer.parseInt(null),
                    null,
                    "Login Failed: " + e.getMessage(),
                    false
            );
        }
    }

//    public LoginResponse adminLogin(LoginRequest request) {
//        LoginResponse response = login(request);
//        if (response.isSuccess() && !"ADMIN".equalsIgnoreCase(response.getRole())) {
//            return new LoginResponse(id,null, "Access Denied: User is not an Administrator", false);
//        }
//        return response;
//    }

    public UserResponseDto getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        return convertToDto(user);
    }

    public UserResponseDto updateProfile(String email, UserRegisterDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));

        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty() && !user.getUsername().equals(dto.getUsername())) {
            if (userRepository.existsByUsername(dto.getUsername())) {
                throw new RuntimeException("Username already exists!");
            }
            user.setUsername(dto.getUsername());
        }

        if (dto.getFirstName() != null) {
            user.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            user.setLastName(dto.getLastName());
        }
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        log.info("Profile updated for user: {}", email);
        return convertToDto(updatedUser);
    }
}