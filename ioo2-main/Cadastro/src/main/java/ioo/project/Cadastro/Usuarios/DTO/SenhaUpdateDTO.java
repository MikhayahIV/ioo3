package ioo.project.Cadastro.Usuarios.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SenhaUpdateDTO(
        @NotBlank(message = "A senha atual não pode estar em branco.")
        String senhaAtual,
        @NotBlank(message = "A senha não pode estar em branco.")
        @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres.")
        @Pattern(regexp = "^(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).*$",
                message = "A senha deve conter pelo menos um número e um caractere especial.")
        String novaSenha

) {}