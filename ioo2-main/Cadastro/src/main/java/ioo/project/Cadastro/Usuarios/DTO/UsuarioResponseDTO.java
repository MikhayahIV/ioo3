package ioo.project.Cadastro.Usuarios.DTO;

import ioo.project.Cadastro.Usuarios.Models.Genero;
import ioo.project.Cadastro.Usuarios.Models.Role;

import java.time.LocalDate;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String sobrenome,
        String email,
        String telefone,
        String endereco,
        String foto,
        LocalDate dataNascimento,
        Genero genero,
        Role role,
        String token
) {}
