package kz.edu.sms.dto.user;
import lombok.Data;

@Data
public class UserProfileRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String bio;
}
