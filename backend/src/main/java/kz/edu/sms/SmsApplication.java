package kz.edu.sms;
import kz.edu.sms.entity.User;
import kz.edu.sms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication @RequiredArgsConstructor
public class SmsApplication implements CommandLineRunner {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public static void main(String[] args){ SpringApplication.run(SmsApplication.class, args); }

    @Override public void run(String... args){
        if(!userRepo.existsByUsername("admin")){
            userRepo.save(User.builder()
                .username("admin").password(encoder.encode("admin123"))
                .email("admin@edu.kz").firstName("Admin").lastName("User")
                .role(User.Role.ADMIN).build());
            System.out.println("✅ Admin user created: admin / admin123");
        }
        if(!userRepo.existsByUsername("teacher")){
            userRepo.save(User.builder()
                .username("teacher").password(encoder.encode("teach123"))
                .email("teacher@edu.kz").firstName("Teacher").lastName("User")
                .role(User.Role.TEACHER).build());
        }
    }
}
