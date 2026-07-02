package kz.edu.sms.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.edu.sms.dto.note.NoteRequest;
import kz.edu.sms.dto.note.NoteResponse;
import kz.edu.sms.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/notes") @RequiredArgsConstructor
@Tag(name = "Notes")
public class NoteController {

    private final NoteService service;

    @GetMapping @Operation(summary = "Get all notes for current user")
    public ResponseEntity<List<NoteResponse>> getAll(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(service.getAll(ud.getUsername(), search));
    }

    @PostMapping @Operation(summary = "Create note")
    public ResponseEntity<NoteResponse> create(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody NoteRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(ud.getUsername(), req));
    }

    @PutMapping("/{id}") @Operation(summary = "Update note")
    public ResponseEntity<NoteResponse> update(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest req) {
        return ResponseEntity.ok(service.update(ud.getUsername(), id, req));
    }

    @DeleteMapping("/{id}") @Operation(summary = "Delete note")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {
        service.delete(ud.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
