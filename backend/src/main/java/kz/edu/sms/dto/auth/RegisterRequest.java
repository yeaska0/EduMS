package kz.edu.sms.dto.auth;
import jakarta.validation.constraints.*;
import kz.edu.sms.entity.User;
import lombok.Data;
@Data public class RegisterRequest {
    @NotBlank @Size(min=3,max=50) private String username;
    @NotBlank @Size(min=6) private String password;
    @Email private String email;
    private String firstName;
    private String lastName;
    private User.Role role;
}
