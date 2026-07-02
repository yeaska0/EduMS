package kz.edu.sms.service;

import kz.edu.sms.dto.note.NoteRequest;
import kz.edu.sms.dto.note.NoteResponse;
import kz.edu.sms.entity.Course;
import kz.edu.sms.entity.Note;
import kz.edu.sms.entity.User;
import kz.edu.sms.exception.ResourceNotFoundException;
import kz.edu.sms.repository.CourseRepository;
import kz.edu.sms.repository.NoteRepository;
import kz.edu.sms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepo;
    private final UserRepository userRepo;
    private final CourseRepository courseRepo;

    public List<NoteResponse> getAll(String username, String search) {
        User user = userRepo.findByUsername(username).orElseThrow();
        List<Note> notes = (search != null && !search.isBlank())
                ? noteRepo.search(user.getId(), search)
                : noteRepo.findByUserIdOrderByPinnedDescUpdatedAtDesc(user.getId());
        return notes.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public NoteResponse create(String username, NoteRequest req) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Course course = req.getCourseId() != null
                ? courseRepo.findById(req.getCourseId()).orElse(null) : null;

        Note note = Note.builder()
                .user(user)
                .course(course)
                .title(req.getTitle())
                .content(req.getContent())
                .tags(req.getTags())
                .pinned(req.isPinned())
                .build();
        return toResponse(noteRepo.save(note));
    }

    @Transactional
    public NoteResponse update(String username, Long id, NoteRequest req) {
        Note note = findOwned(username, id);
        Course course = req.getCourseId() != null
                ? courseRepo.findById(req.getCourseId()).orElse(null) : null;

        note.setTitle(req.getTitle());
        note.setContent(req.getContent());
        note.setTags(req.getTags());
        note.setPinned(req.isPinned());
        note.setCourse(course);
        return toResponse(noteRepo.save(note));
    }

    @Transactional
    public void delete(String username, Long id) {
        noteRepo.delete(findOwned(username, id));
    }

    private Note findOwned(String username, Long id) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Note note = noteRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        if (!note.getUser().getId().equals(user.getId()))
            throw new ResourceNotFoundException("Note not found");
        return note;
    }

    private NoteResponse toResponse(Note n) {
        NoteResponse r = new NoteResponse();
        r.setId(n.getId());
        r.setTitle(n.getTitle());
        r.setContent(n.getContent());
        r.setTags(n.getTags());
        r.setPinned(n.isPinned());
        r.setCreatedAt(n.getCreatedAt());
        r.setUpdatedAt(n.getUpdatedAt());
        if (n.getCourse() != null) {
            r.setCourseId(n.getCourse().getId());
            r.setCourseName(n.getCourse().getName());
        }
        return r;
    }
}
