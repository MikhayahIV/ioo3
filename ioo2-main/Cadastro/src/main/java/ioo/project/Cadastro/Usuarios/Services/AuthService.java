package ioo.project.Cadastro.Usuarios.Services;

import ioo.project.Cadastro.Usuarios.DTO.LoginRequestDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioCadastroDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioResponseDTO;
import ioo.project.Cadastro.Usuarios.Models.UsuariosModel;
import ioo.project.Cadastro.Usuarios.Models.Role;
import ioo.project.Cadastro.Usuarios.SecurityTools.JWTUtil;
import ioo.project.Cadastro.Usuarios.UsuariosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UsuariosRepository repository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    @Autowired
    private JWTUtil tokenService;

    private UsuarioResponseDTO toDTO(UsuariosModel u){
        return new UsuarioResponseDTO(
                u.getId(),
                u.getNome(),
                u.getSobrenome(),
                u.getEmail(),
                u.getTelefone(),
                u.getEndereco(),
                u.getFoto(),
                u.getDataNascimento(),
                u.getGenero(),
                u.getRole(),
                null
        );
    }


    public UsuarioResponseDTO registrar(UsuarioCadastroDTO dto) {
        if (repository.findByEmail(dto.email()).isPresent()) {
            throw new RuntimeException("email já registrado");
        }
        UsuariosModel user = new UsuariosModel(
                null,
                dto.nome(),
                dto.sobrenome(),
                dto.email(),
                passwordEncoder.encode(dto.senha()),
                dto.telefone(),
                dto.endereco(),
                null,
                dto.dataNascimento(),
                dto.genero(),
                Role.ROLE_USER


        );
        UsuariosModel salvo = repository.save(user);

        String token = tokenService.generateToken(
                salvo.getNome(),
                salvo.getId(),
                salvo.getEmail()
        );

        return new UsuarioResponseDTO(
                salvo.getId(),
                salvo.getNome(),
                salvo.getSobrenome(),
                salvo.getEmail(),
                salvo.getTelefone(),
                salvo.getEndereco(),
                salvo.getFoto(),
                salvo.getDataNascimento(),
                salvo.getGenero(),
                salvo.getRole(),
                token
        );
    }




    public UsuarioResponseDTO login(LoginRequestDTO dto){
        UsuariosModel user = repository.findByEmail(dto.email()).orElseThrow(()-> new RuntimeException("Usuário não encontrado"));
        if (!passwordEncoder.matches(dto.senha(), user.getSenha())){
            throw new RuntimeException("Senha incorreta");
        }
        String token = tokenService.generateToken(
                user.getEmail(),
                user.getId(),
                user.getEmail()
        );
        return new UsuarioResponseDTO(
                user.getId(),
                user.getNome(),
                user.getSobrenome(),
                user.getEmail(),
                user.getTelefone(),
                user.getEndereco(),
                user.getFoto(),
                user.getDataNascimento(),
                user.getGenero(),
                user.getRole(),
                token
        );
    }

}
