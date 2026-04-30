package smart_campus_backend.mail;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.time.Year;

@Service
@Slf4j
public class InviteEmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String fromName;

    public InviteEmailService(
            @Autowired(required = false) JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${app.mail.from-name:Smart Campus}") String configuredFromName) {
        this.mailSender = mailSender;
        this.fromAddress = mailUsername != null ? mailUsername.trim() : "";
        this.fromName = configuredFromName != null ? configuredFromName.trim() : "Smart Campus";
    }

    public void sendAdminInvite(String toEmail, String inviteUrl, String targetRoleName, long expirationHours) {
        if (mailSender == null || fromAddress.isEmpty()) {
            log.warn("Invite email skipped: configure MAIL_USERNAME and MAIL_PASSWORD for Gmail SMTP");
            return;
        }
        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Smart Campus - admin invite");
            helper.setText(buildInviteHtml(inviteUrl, targetRoleName, expirationHours), true);
            mailSender.send(message);
        } catch (MailException | UnsupportedEncodingException | jakarta.mail.MessagingException ex) {
            log.error("Failed to send invite email to {}: {}", toEmail, ex.getMessage());
        }
    }

    private String buildInviteHtml(String inviteUrl, String targetRoleName, long expirationHours) {
        String safeRole = escapeHtml(targetRoleName == null ? "ADMIN" : targetRoleName);
        String safeInviteUrl = escapeHtml(inviteUrl == null ? "" : inviteUrl);
        return """
                <!doctype html>
                <html>
                <head>
                  <meta charset="UTF-8"/>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                  <title>Smart Campus - Admin Invite</title>
                </head>
                <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                          <tr>
                            <td style="padding:16px 20px;background:linear-gradient(90deg,#1d4ed8,#7c3aed);color:#ffffff;">
                              <h1 style="margin:0;font-size:18px;line-height:1.3;">Smart Campus</h1>
                              <p style="margin:4px 0 0 0;font-size:12px;opacity:0.9;">Admin Invitation</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:20px;">
                              <h2 style="margin:0 0 12px 0;font-size:16px;line-height:1.4;color:#0f172a;">You are invited as %s</h2>
                              <p style="margin:0 0 14px 0;font-size:14px;line-height:1.7;color:#334155;">
                                You have been invited to join Smart Campus. Use the button below to complete account setup.
                                This invite expires in <strong>%d hours</strong>.
                              </p>
                              <p style="margin:0 0 16px 0;">
                                <a href="%s" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 16px;border-radius:8px;">
                                  Complete Signup
                                </a>
                              </p>
                              <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;">
                                If the button does not work, copy and paste this URL into your browser:<br/>
                                <span style="word-break:break-all;">%s</span>
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:14px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                              <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">
                                If you did not expect this invite, you can safely ignore this email.
                              </p>
                              <p style="margin:4px 0 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">
                                &copy; %d Smart Campus
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(safeRole, expirationHours, safeInviteUrl, safeInviteUrl, Year.now().getValue());
    }

    private String escapeHtml(String input) {
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
