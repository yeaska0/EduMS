package kz.edu.sms.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.edu.sms.dto.auth.*;
import kz.edu.sms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
@Tag(name="Authentication")
public class AuthController {
    private final AuthService service;

    @PostMapping("/login") @Operation(summary="Login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req){
        return ResponseEntity.ok(service.login(req));
    }

    @PostMapping("/register") @Operation(summary="Register new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req){
        return ResponseEntity.status(201).body(service.register(req));
    }

    @PostMapping("/refresh") @Operation(summary="Refresh access token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req){
        return ResponseEntity.ok(service.refresh(req));
    }

    @PostMapping("/logout") @Operation(summary="Logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest req){
        service.logout(req);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/change-password") @Operation(summary="Change password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody ChangePasswordRequest req){
        service.changePassword(ud.getUsername(), req);
        return ResponseEntity.noContent().build();
    }
}
