package ioo.project.Cadastro.Usuarios.Services;

import ioo.project.Cadastro.Usuarios.DTO.SenhaUpdateDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioCadastroDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioResponseDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioUpdateDTO;
import ioo.project.Cadastro.Usuarios.Models.Role;
import ioo.project.Cadastro.Usuarios.Models.UsuariosModel;
import ioo.project.Cadastro.Usuarios.UsuariosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UsuariosRepository usuariosRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;



    // Métodos auxiliares para conversão de DTO (mantidos)
    private UsuarioResponseDTO toResponseDTO(UsuariosModel usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getSobrenome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getEndereco(),
                usuario.getFoto(),
                usuario.getDataNascimento(),
                usuario.getGenero(),
                usuario.getRole(),
                null
        );
    }

    // --- Operações CRUD existentes (mantidas) ---

    @PreAuthorize("hasRole('ADMIN')")
    public List<UsuarioResponseDTO> getAllUsers() {
        return usuariosRepository.findAll().stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Page<UsuarioResponseDTO> getAllUsersPaged(Pageable pageable) {
        return usuariosRepository.findAll(pageable).map(this::toResponseDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioResponseDTO getUserById(Long id) {
        UsuariosModel usuario = usuariosRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado com ID: " + id));
        return toResponseDTO(usuario);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioResponseDTO createNewUser(UsuarioCadastroDTO dto, Role role) {
        if (usuariosRepository.findByEmail(dto.email()).isPresent()) {
            throw new IllegalArgumentException("Email já registrado.");
        }
        UsuariosModel newUser = new UsuariosModel(
                null, dto.nome(), dto.sobrenome(), dto.email(),
                passwordEncoder.encode(dto.senha()), dto.telefone(), dto.endereco(),
                null, dto.dataNascimento(), dto.genero(), role
        );
        UsuariosModel savedUser = usuariosRepository.save(newUser);
        return toResponseDTO(savedUser);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioResponseDTO updateAnyUserProfile(Long id, UsuarioUpdateDTO dto) {
        UsuariosModel usuario = usuariosRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado com ID: " + id));

        Optional.ofNullable(dto.nome()).ifPresent(usuario::setNome);
        Optional.ofNullable(dto.sobrenome()).ifPresent(usuario::setSobrenome);
        Optional.ofNullable(dto.email()).ifPresent(usuario::setEmail);
        // Não atualizar senha aqui. Ela será tratada pelo método específico de senha.
        Optional.ofNullable(dto.telefone()).ifPresent(usuario::setTelefone);
        Optional.ofNullable(dto.endereco()).ifPresent(usuario::setEndereco);
        Optional.ofNullable(dto.dataNascimento()).ifPresent(usuario::setDataNascimento);
        Optional.ofNullable(dto.genero()).ifPresent(usuario::setGenero);
        // Opcional: Se o admin pode alterar a role via PUT geral, você pode adicionar aqui
        // Optional.ofNullable(dto.getRole()).ifPresent(usuario::setRole);

        UsuariosModel updatedUser = usuariosRepository.save(usuario);
        return toResponseDTO(updatedUser);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAnyUser(Long id) {
        if (!usuariosRepository.existsById(id)) {
            throw new NoSuchElementException("Usuário não encontrado com ID: " + id);
        }
        usuariosRepository.deleteById(id);
    }


    // NOVO MÉTODO: Alterar a senha de qualquer usuário por um admin
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioResponseDTO updateUserPassword(Long userId, SenhaUpdateDTO passwordDto) {
        if (passwordDto.novaSenha() == null || passwordDto.novaSenha().isEmpty()) {
            throw new IllegalArgumentException("A nova senha não pode ser vazia.");
        }

        UsuariosModel usuario = usuariosRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado com ID: " + userId));

        usuario.setSenha(passwordEncoder.encode(passwordDto.novaSenha()));
        UsuariosModel updatedUser = usuariosRepository.save(usuario);
        return toResponseDTO(updatedUser);
    }
}