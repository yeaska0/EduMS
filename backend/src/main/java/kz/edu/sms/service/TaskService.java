package kz.edu.sms.service;

import kz.edu.sms.dto.task.TaskRequest;
import kz.edu.sms.dto.task.TaskResponse;
import kz.edu.sms.entity.Course;
import kz.edu.sms.entity.Task;
import kz.edu.sms.entity.User;
import kz.edu.sms.exception.ResourceNotFoundException;
import kz.edu.sms.repository.CourseRepository;
import kz.edu.sms.repository.TaskRepository;
import kz.edu.sms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepo;
    private final UserRepository userRepo;
    private final CourseRepository courseRepo;

    public List<TaskResponse> getAll(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return taskRepo.findByUserIdOrderByDueDateAscCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public TaskResponse create(String username, TaskRequest req) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Course course = req.getCourseId() != null
                ? courseRepo.findById(req.getCourseId()).orElse(null) : null;

        Task task = Task.builder()
                .user(user)
                .course(course)
                .title(req.getTitle())
                .description(req.getDescription())
                .dueDate(req.getDueDate())
                .priority(req.getPriority() != null ? req.getPriority() : Task.Priority.MEDIUM)
                .status(req.getStatus() != null ? req.getStatus() : Task.TaskStatus.TODO)
                .build();
        return toResponse(taskRepo.save(task));
    }

    @Transactional
    public TaskResponse update(String username, Long id, TaskRequest req) {
        Task task = findOwned(username, id);
        Course course = req.getCourseId() != null
                ? courseRepo.findById(req.getCourseId()).orElse(null) : null;

        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        task.setDueDate(req.getDueDate());
        task.setCourse(course);
        if (req.getPriority() != null) task.setPriority(req.getPriority());
        if (req.getStatus() != null) task.setStatus(req.getStatus());
        return toResponse(taskRepo.save(task));
    }

    @Transactional
    public void delete(String username, Long id) {
        taskRepo.delete(findOwned(username, id));
    }

    private Task findOwned(String username, Long id) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Task task = taskRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        if (!task.getUser().getId().equals(user.getId()))
            throw new ResourceNotFoundException("Task not found");
        return task;
    }

    private TaskResponse toResponse(Task t) {
        TaskResponse r = new TaskResponse();
        r.setId(t.getId());
        r.setTitle(t.getTitle());
        r.setDescription(t.getDescription());
        r.setDueDate(t.getDueDate());
        r.setPriority(t.getPriority());
        r.setStatus(t.getStatus());
        r.setCreatedAt(t.getCreatedAt());
        r.setUpdatedAt(t.getUpdatedAt());
        if (t.getCourse() != null) {
            r.setCourseId(t.getCourse().getId());
            r.setCourseName(t.getCourse().getName());
        }
        return r;
    }
}
