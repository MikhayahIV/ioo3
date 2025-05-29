package ioo.project.Cadastro.Usuarios.DTO;

import java.time.Instant;

public record ErrorResponseDTO(
        String message,
        int status,
        String error,
        Instant timestamp
){}
