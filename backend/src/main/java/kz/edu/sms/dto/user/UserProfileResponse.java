package kz.edu.sms.dto.user;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class UserProfileResponse {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String bio;
    private String role;
    private String createdAt;
}
