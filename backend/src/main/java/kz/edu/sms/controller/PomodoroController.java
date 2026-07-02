package kz.edu.sms.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kz.edu.sms.dto.pomodoro.PomodoroRequest;
import kz.edu.sms.dto.pomodoro.PomodoroResponse;
import kz.edu.sms.service.PomodoroService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/pomodoro") @RequiredArgsConstructor
@Tag(name = "Pomodoro")
public class PomodoroController {

    private final PomodoroService service;

    @GetMapping @Operation(summary = "Get pomodoro history")
    public ResponseEntity<List<PomodoroResponse>> getAll(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(service.getAll(ud.getUsername()));
    }

    @GetMapping("/stats") @Operation(summary = "Get completed sessions count")
    public ResponseEntity<Map<String, Long>> stats(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(Map.of("completed", service.getCompletedCount(ud.getUsername())));
    }

    @PostMapping @Operation(summary = "Save completed pomodoro session")
    public ResponseEntity<PomodoroResponse> save(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody PomodoroRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(ud.getUsername(), req));
    }
}
