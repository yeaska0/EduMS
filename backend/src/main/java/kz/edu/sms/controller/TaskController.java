package kz.edu.sms.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.edu.sms.dto.task.TaskRequest;
import kz.edu.sms.dto.task.TaskResponse;
import kz.edu.sms.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/tasks") @RequiredArgsConstructor
@Tag(name = "Tasks")
public class TaskController {

    private final TaskService service;

    @GetMapping @Operation(summary = "Get all tasks for current user")
    public ResponseEntity<List<TaskResponse>> getAll(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(service.getAll(ud.getUsername()));
    }

    @PostMapping @Operation(summary = "Create task")
    public ResponseEntity<TaskResponse> create(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody TaskRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(ud.getUsername(), req));
    }

    @PutMapping("/{id}") @Operation(summary = "Update task")
    public ResponseEntity<TaskResponse> update(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest req) {
        return ResponseEntity.ok(service.update(ud.getUsername(), id, req));
    }

    @DeleteMapping("/{id}") @Operation(summary = "Delete task")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {
        service.delete(ud.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
