package ioo.project.Cadastro.Usuarios.Services;

import ioo.project.Cadastro.Usuarios.DTO.SenhaUpdateDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioResponseDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioUpdateDTO;
import ioo.project.Cadastro.Usuarios.Models.UsuariosModel;
import ioo.project.Cadastro.Usuarios.UsuariosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger; // Importe o Logger
import org.slf4j.LoggerFactory; // Importe o LoggerFactory

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    @Autowired
    private UsuariosRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    private UsuariosModel getUser(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    private UsuarioResponseDTO toDTO(UsuariosModel u) {
        return new UsuarioResponseDTO(
                u.getId(), u.getNome(), u.getSobrenome(), u.getEmail(), u.getTelefone(),
                u.getEndereco(), u.getFoto(), u.getDataNascimento(),u.getGenero(),u.getRole(), null
        );
    }

    public UsuarioResponseDTO getById(Long id){
        return toDTO(getUser(id));
    }

    public UsuarioResponseDTO updateUserProfile(Long userId, UsuarioUpdateDTO updateRequest) {
        UsuariosModel usuario = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        if (updateRequest.nome() != null && !updateRequest.nome().isEmpty()) {
            usuario.setNome(updateRequest.nome());
        }
        if (updateRequest.sobrenome() != null && !updateRequest.sobrenome().isEmpty()) {
            usuario.setSobrenome(updateRequest.sobrenome());
        }
        if (updateRequest.email() != null && !updateRequest.email().isEmpty()) {
            if (repository.findByEmail(updateRequest.email()).isPresent() &&
                    !repository.findByEmail(updateRequest.email()).get().getId().equals(userId)) {
                throw new RuntimeException("Email já cadastrado para outro usuário.");
            }
            usuario.setEmail(updateRequest.email());
        }
        if (updateRequest.telefone() != null && !updateRequest.telefone().isEmpty()) {
            usuario.setTelefone(updateRequest.telefone());
        }
        if (updateRequest.endereco() != null && !updateRequest.endereco().isEmpty()) {
            usuario.setEndereco(updateRequest.endereco());
        }
        if (updateRequest.dataNascimento() != null) {
            usuario.setDataNascimento(updateRequest.dataNascimento());
        }
        if (updateRequest.genero() != null ) {
            usuario.setGenero(updateRequest.genero());
        }

        UsuariosModel updatedUser = repository.save(usuario);
        return toDTO(updatedUser);
    }

    public void changeUserPassword(Long userId, String currentPassword, String newPassword) {
        UsuariosModel usuario = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        if (!passwordEncoder.matches(currentPassword, usuario.getSenha())) {
            throw new RuntimeException("Senha atual incorreta.");
        }

        String encodedNewPassword = passwordEncoder.encode(newPassword);

        usuario.setSenha(encodedNewPassword);
        repository.save(usuario);
    }

    public void deleteUser(Long userId) {
        if (!repository.existsById(userId)) {
            throw new RuntimeException("Usuário não encontrado para exclusão.");
        }
        repository.deleteById(userId);
    }

    public String uploadProfilePicture(Long userId, MultipartFile file) {
        UsuariosModel usuario = repository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        if (file.isEmpty()) {
            throw new RuntimeException("Por favor, selecione um arquivo para upload.");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFileName);

            Files.copy(file.getInputStream(), filePath);

            String imageUrl = "/uploads/" + uniqueFileName;

            usuario.setFoto(imageUrl);
            repository.save(usuario);

            return imageUrl;
        } catch (IOException e) {
            throw new RuntimeException("Falha ao fazer upload da foto: " + e.getMessage(), e);
        }
    }

    public Optional<UsuariosModel> findByEmail(String email) {
        return repository.findByEmail(email);
    }

}
