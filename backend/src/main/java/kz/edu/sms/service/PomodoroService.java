package kz.edu.sms.service;

import kz.edu.sms.dto.pomodoro.PomodoroRequest;
import kz.edu.sms.dto.pomodoro.PomodoroResponse;
import kz.edu.sms.entity.PomodoroSession;
import kz.edu.sms.entity.Task;
import kz.edu.sms.entity.User;
import kz.edu.sms.repository.PomodoroSessionRepository;
import kz.edu.sms.repository.TaskRepository;
import kz.edu.sms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class PomodoroService {

    private final PomodoroSessionRepository pomodoroRepo;
    private final UserRepository userRepo;
    private final TaskRepository taskRepo;

    public List<PomodoroResponse> getAll(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return pomodoroRepo.findByUserIdOrderByStartedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long getCompletedCount(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return pomodoroRepo.countCompleted(user.getId());
    }

    @Transactional
    public PomodoroResponse save(String username, PomodoroRequest req) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Task task = req.getTaskId() != null
                ? taskRepo.findById(req.getTaskId()).orElse(null) : null;

        PomodoroSession session = PomodoroSession.builder()
                .user(user)
                .task(task)
                .durationMinutes(req.getDurationMinutes() != null ? req.getDurationMinutes() : 25)
                .completed(req.isCompleted())
                .build();
        return toResponse(pomodoroRepo.save(session));
    }

    private PomodoroResponse toResponse(PomodoroSession s) {
        PomodoroResponse r = new PomodoroResponse();
        r.setId(s.getId());
        r.setDurationMinutes(s.getDurationMinutes());
        r.setCompleted(s.isCompleted());
        r.setStartedAt(s.getStartedAt());
        if (s.getTask() != null) {
            r.setTaskId(s.getTask().getId());
            r.setTaskTitle(s.getTask().getTitle());
        }
        return r;
    }
}
