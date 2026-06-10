package kz.edu.sms.config;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;

@Configuration
public class SwaggerConfig {
    @Bean public OpenAPI openAPI(){
        return new OpenAPI()
            .info(new Info().title("EduMS API").version("1.0.0").description("Student Management System REST API"))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components().addSecuritySchemes("bearerAuth",
                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }
}
