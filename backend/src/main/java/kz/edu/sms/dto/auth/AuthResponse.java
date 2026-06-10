package kz.edu.sms.dto.auth;
import lombok.*;
@Data @AllArgsConstructor @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private String username;
    private String role;
    private String name;
}
