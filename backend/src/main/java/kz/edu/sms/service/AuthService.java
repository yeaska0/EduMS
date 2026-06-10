package kz.edu.sms.service;
import kz.edu.sms.dto.auth.*;
import kz.edu.sms.entity.*;
import kz.edu.sms.exception.DuplicateResourceException;
import kz.edu.sms.repository.UserRepository;
import kz.edu.sms.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor @Transactional
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final RefreshTokenService refreshTokenService;

    public AuthResponse login(LoginRequest req){
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        User user = userRepo.findByUsername(req.getUsername()).orElseThrow();
        String access  = jwtUtil.generateToken(user);
        String refresh = refreshTokenService.create(user).getToken();
        return build(user, access, refresh);
    }

    public AuthResponse register(RegisterRequest req){
        if(userRepo.existsByUsername(req.getUsername()))
            throw new DuplicateResourceException("Username already taken: " + req.getUsername());
        if(req.getEmail()!=null && userRepo.existsByEmail(req.getEmail()))
            throw new DuplicateResourceException("Email already in use: " + req.getEmail());
        User user = User.builder()
            .username(req.getUsername())
            .password(encoder.encode(req.getPassword()))
            .email(req.getEmail())
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .role(req.getRole() != null ? req.getRole() : User.Role.ADMIN)
            .build();
        userRepo.save(user);
        String access  = jwtUtil.generateToken(user);
        String refresh = refreshTokenService.create(user).getToken();
        return build(user, access, refresh);
    }

    public AuthResponse refresh(RefreshRequest req){
        var rt   = refreshTokenService.verify(req.getRefreshToken());
        User user = rt.getUser();
        String access  = jwtUtil.generateToken(user);
        String refresh = refreshTokenService.create(user).getToken();
        return build(user, access, refresh);
    }

    public void logout(RefreshRequest req){ refreshTokenService.deleteByToken(req.getRefreshToken()); }

    private AuthResponse build(User u, String access, String refresh){
        String name = (u.getFirstName()!=null?u.getFirstName()+" ":"") + (u.getLastName()!=null?u.getLastName():"");
        return AuthResponse.builder()
            .accessToken(access).refreshToken(refresh).tokenType("Bearer")
            .username(u.getUsername()).role(u.getRole().name())
            .name(name.isBlank() ? u.getUsername() : name.trim())
            .build();
    }
}
