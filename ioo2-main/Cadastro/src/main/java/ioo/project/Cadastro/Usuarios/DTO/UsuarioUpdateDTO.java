package ioo.project.Cadastro.Usuarios.DTO;

import ioo.project.Cadastro.Usuarios.Models.Genero;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record UsuarioUpdateDTO(
        @NotBlank(message = "O nome não pode estar em branco.")
        String nome,

        @NotBlank(message = "O sobrenome não pode estar em branco.")
        String sobrenome,


        @NotBlank(message = "O email não pode estar em branco.")
        @Email(message = "Formato de email inválido.")
        @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$",
                message = "O email deve conter '@' e um domínio válido (ex: .com, .net).")
        String email,

        String telefone,
        String endereco,

        @NotNull(message = "a data não pode estar vazia")
        LocalDate dataNascimento,

        Genero genero
) {}