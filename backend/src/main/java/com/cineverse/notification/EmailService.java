package com.cineverse.notification;

import com.cineverse.config.CineverseProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final CineverseProperties properties;

    public EmailService(JavaMailSender mailSender, CineverseProperties properties) {
        this.mailSender = mailSender;
        this.properties = properties;
    }

    public void sendPasswordReset(String to, String token) {
        String link = properties.getPublicFrontendUrl() + "/reset-password?token=" + token;
        send(to, "Aurora Cinema — reset password",
                "Use this link within 1 hour:\n" + link + "\n\nOr enter token: " + token);
    }

    private void send(String to, String subject, String body) {
        if (!properties.isMailEnabled()) {
            log.info("Mail disabled — would send to {}: {} — {}", to, subject, body);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.getMailFrom());
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
