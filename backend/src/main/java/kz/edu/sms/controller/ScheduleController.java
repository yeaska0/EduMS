package kz.edu.sms.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.edu.sms.dto.schedule.ScheduleRequest;
import kz.edu.sms.dto.schedule.ScheduleResponse;
import kz.edu.sms.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/schedule") @RequiredArgsConstructor
@Tag(name = "Schedule")
public class ScheduleController {

    private final ScheduleService service;

    @GetMapping @Operation(summary = "Get weekly schedule")
    public ResponseEntity<List<ScheduleResponse>> getAll(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(service.getAll(ud.getUsername()));
    }

    @PostMapping @Operation(summary = "Add schedule event")
    public ResponseEntity<ScheduleResponse> create(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody ScheduleRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(ud.getUsername(), req));
    }

    @PutMapping("/{id}") @Operation(summary = "Update schedule event")
    public ResponseEntity<ScheduleResponse> update(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequest req) {
        return ResponseEntity.ok(service.update(ud.getUsername(), id, req));
    }

    @DeleteMapping("/{id}") @Operation(summary = "Delete schedule event")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {
        service.delete(ud.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
