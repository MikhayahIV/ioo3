package ioo.project.Cadastro.Usuarios.SecurityTools;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica as regras CORS a TODAS as rotas do seu backend
                .allowedOrigins(
                        "http://localhost:8080"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // Métodos HTTP que você usa
                .allowedHeaders("*")    // Permite todos os cabeçalhos
                .allowCredentials(true); // Permite o envio de credenciais (como o JWT no Authorization header)
    }
}