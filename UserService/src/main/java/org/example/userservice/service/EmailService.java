package org.example.userservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendVerificationCode(String toEmail, String code) {
        if (mailSender == null) {
            System.out.println("[EmailService Simulation] MailSender bean not loaded. Verification Code for " + toEmail + " is: " + code);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("E-Commerce Account Verification Code");
            message.setText("Hello,\n\nYour account verification code is: " + code + "\n\nThis code expires in 15 minutes.\n\nThank you!");
            mailSender.send(message);
            System.out.println("[EmailService] Verification mail sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("[EmailService Error] Failed to send email to " + toEmail + ": " + e.getMessage());
            System.out.println("[EmailService Simulation Fallback] Verification Code for " + toEmail + " is: " + code);
        }
    }
}
