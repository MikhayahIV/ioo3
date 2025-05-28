package ioo.project.Cadastro.Usuarios.DTO;

import java.time.Instant;

public record ErrorResponseDTO(
        String message,
        int status,
        String error,
        Instant timestamp // Usando Instant para um timestamp mais moderno
){}
