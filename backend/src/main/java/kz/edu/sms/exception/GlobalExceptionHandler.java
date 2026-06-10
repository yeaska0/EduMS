package kz.edu.sms.exception;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    record ErrorResponse(int status, String error, Object message, LocalDateTime timestamp){}

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(ResourceNotFoundException e){
        return build(HttpStatus.NOT_FOUND, e.getMessage());
    }
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> conflict(DuplicateResourceException e){
        return build(HttpStatus.CONFLICT, e.getMessage());
    }
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> badRequest(BadRequestException e){
        return build(HttpStatus.BAD_REQUEST, e.getMessage());
    }
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> badCreds(BadCredentialsException e){
        return build(HttpStatus.UNAUTHORIZED, "Неверный логин или пароль");
    }
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> authEx(AuthenticationException e){
        return build(HttpStatus.UNAUTHORIZED, e.getMessage() != null ? e.getMessage() : "Ошибка аутентификации");
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException e){
        Map<String,String> errors = new LinkedHashMap<>();
        e.getBindingResult().getAllErrors().forEach(err -> {
            String field = err instanceof FieldError fe ? fe.getField() : err.getObjectName();
            errors.put(field, err.getDefaultMessage());
        });
        return build(HttpStatus.BAD_REQUEST, errors);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> generic(Exception e){
        e.printStackTrace();
        String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
        return build(HttpStatus.INTERNAL_SERVER_ERROR, msg);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus s, Object msg){
        return ResponseEntity.status(s).body(new ErrorResponse(s.value(), s.getReasonPhrase(), msg, LocalDateTime.now()));
    }
}
