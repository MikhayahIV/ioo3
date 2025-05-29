package ioo.project.Cadastro.Usuarios.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name="tb_cadastro")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuariosModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String sobrenome;

    private String email;

    private String senha;

    private String telefone;

    private String endereco;

    private String foto;

    private LocalDate dataNascimento;

    @Enumerated(EnumType.STRING)
    private Genero genero;

    @Enumerated(EnumType.STRING)
    private Role role;

}
