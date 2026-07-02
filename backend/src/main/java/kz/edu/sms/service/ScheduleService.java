package kz.edu.sms.service;

import kz.edu.sms.dto.schedule.ScheduleRequest;
import kz.edu.sms.dto.schedule.ScheduleResponse;
import kz.edu.sms.entity.Course;
import kz.edu.sms.entity.ScheduleEvent;
import kz.edu.sms.entity.User;
import kz.edu.sms.exception.ResourceNotFoundException;
import kz.edu.sms.repository.CourseRepository;
import kz.edu.sms.repository.ScheduleEventRepository;
import kz.edu.sms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleEventRepository scheduleRepo;
    private final UserRepository userRepo;
    private final CourseRepository courseRepo;

    public List<ScheduleResponse> getAll(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return scheduleRepo.findByUserIdOrderByDayOfWeekAscStartTimeAsc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ScheduleResponse create(String username, ScheduleRequest req) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Course course = req.getCourseId() != null
                ? courseRepo.findById(req.getCourseId()).orElse(null) : null;

        ScheduleEvent event = ScheduleEvent.builder()
                .user(user).course(course)
                .title(req.getTitle())
                .instructor(req.getInstructor())
                .room(req.getRoom())
                .dayOfWeek(req.getDayOfWeek())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .color(req.getColor() != null ? req.getColor() : "#6366f1")
                .type(req.getType() != null ? req.getType() : ScheduleEvent.EventType.LECTURE)
                .build();
        return toResponse(scheduleRepo.save(event));
    }

    @Transactional
    public ScheduleResponse update(String username, Long id, ScheduleRequest req) {
        ScheduleEvent event = findOwned(username, id);
        Course course = req.getCourseId() != null
                ? courseRepo.findById(req.getCourseId()).orElse(null) : null;

        event.setTitle(req.getTitle());
        event.setInstructor(req.getInstructor());
        event.setRoom(req.getRoom());
        event.setDayOfWeek(req.getDayOfWeek());
        event.setStartTime(req.getStartTime());
        event.setEndTime(req.getEndTime());
        event.setCourse(course);
        if (req.getColor() != null) event.setColor(req.getColor());
        if (req.getType() != null) event.setType(req.getType());
        return toResponse(scheduleRepo.save(event));
    }

    @Transactional
    public void delete(String username, Long id) {
        scheduleRepo.delete(findOwned(username, id));
    }

    private ScheduleEvent findOwned(String username, Long id) {
        User user = userRepo.findByUsername(username).orElseThrow();
        ScheduleEvent ev = scheduleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule event not found"));
        if (!ev.getUser().getId().equals(user.getId()))
            throw new ResourceNotFoundException("Schedule event not found");
        return ev;
    }

    private ScheduleResponse toResponse(ScheduleEvent e) {
        ScheduleResponse r = new ScheduleResponse();
        r.setId(e.getId());
        r.setTitle(e.getTitle());
        r.setInstructor(e.getInstructor());
        r.setRoom(e.getRoom());
        r.setDayOfWeek(e.getDayOfWeek());
        r.setStartTime(e.getStartTime());
        r.setEndTime(e.getEndTime());
        r.setColor(e.getColor());
        r.setType(e.getType());
        if (e.getCourse() != null) {
            r.setCourseId(e.getCourse().getId());
            r.setCourseName(e.getCourse().getName());
        }
        return r;
    }
}
