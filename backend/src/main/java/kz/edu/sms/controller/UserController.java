package kz.edu.sms.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kz.edu.sms.dto.user.*;
import kz.edu.sms.entity.User;
import kz.edu.sms.exception.BadRequestException;
import kz.edu.sms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController @RequestMapping("/api/users") @RequiredArgsConstructor
@Tag(name="Users")
public class UserController {
    private final UserRepository userRepo;

    @GetMapping("/profile") @Operation(summary="Get current user profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetails ud) {
        User user = userRepo.findByUsername(ud.getUsername()).orElseThrow();
        return ResponseEntity.ok(toResponse(user));
    }

    @PutMapping("/profile") @Operation(summary="Update current user profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody UserProfileRequest req) {
        User user = userRepo.findByUsername(ud.getUsername()).orElseThrow();
        if (req.getFirstName() != null) user.setFirstName(req.getFirstName());
        if (req.getLastName() != null) user.setLastName(req.getLastName());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getBio() != null) user.setBio(req.getBio());
        userRepo.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    @GetMapping @PreAuthorize("hasRole('ADMIN')") @Operation(summary="List all users")
    public ResponseEntity<List<UserProfileResponse>> listUsers() {
        return ResponseEntity.ok(userRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList()));
    }

    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") @Operation(summary="Delete user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        User current = userRepo.findByUsername(ud.getUsername()).orElseThrow();
        if (current.getId().equals(id)) throw new BadRequestException("Cannot delete yourself");
        userRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UserProfileResponse toResponse(User u) {
        return UserProfileResponse.builder()
            .id(u.getId())
            .username(u.getUsername())
            .firstName(u.getFirstName())
            .lastName(u.getLastName())
            .email(u.getEmail())
            .phone(u.getPhone())
            .bio(u.getBio())
            .role(u.getRole().name())
            .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
            .build();
    }
}
