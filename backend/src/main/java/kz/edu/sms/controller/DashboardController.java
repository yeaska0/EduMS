package kz.edu.sms.controller;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kz.edu.sms.dto.dashboard.DashboardStats;
import kz.edu.sms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/dashboard") @RequiredArgsConstructor
@Tag(name="Dashboard")
public class DashboardController {
    private final DashboardService service;

    @GetMapping("/stats") @Operation(summary="Get dashboard statistics")
    public ResponseEntity<DashboardStats> stats(){
        return ResponseEntity.ok(service.stats());
    }
}
