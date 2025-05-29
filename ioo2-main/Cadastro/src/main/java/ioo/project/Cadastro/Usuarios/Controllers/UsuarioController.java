package ioo.project.Cadastro.Usuarios.Controllers;

import ioo.project.Cadastro.Usuarios.DTO.ErrorResponseDTO;
import ioo.project.Cadastro.Usuarios.DTO.SenhaUpdateDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioResponseDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioUpdateDTO;
import ioo.project.Cadastro.Usuarios.Services.UsuarioService;
import ioo.project.Cadastro.Usuarios.UsuariosRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('USER')")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

    private UsuariosRepository repository;

    @PutMapping("/{id}/senha")
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<String> changePassword(@PathVariable Long id, @RequestBody @Valid SenhaUpdateDTO request) {
        service.changeUserPassword(id, request.senhaAtual(), request.novaSenha());
        return ResponseEntity.ok("Senha alterada com sucesso!");
    }

    @PutMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody @Valid UsuarioUpdateDTO request) {
        try {
            UsuarioResponseDTO updatedUser = service.updateUserProfile(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value(), "Bad Request", Instant.now()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Ocorreu um erro interno: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", Instant.now()));
        }
    }

    @PostMapping("/{id}/foto") // Ou @PutMapping se for sempre substituir
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<?> uploadProfilePicture(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = service.uploadProfilePicture(id, file);
            return ResponseEntity.ok(imageUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value(), "Bad Request", Instant.now()));
        }
        catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Erro ao fazer upload da foto: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", Instant.now()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            service.deleteUser(id);
            return ResponseEntity.ok("Usuário excluído com sucesso.");
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponseDTO("Usuário não encontrado.", HttpStatus.NOT_FOUND.value(), "Not Found", Instant.now()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Erro ao excluir usuário: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", Instant.now()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or #id == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<?> getUsuarioById(@PathVariable Long id) {
        try {
            UsuarioResponseDTO usuario = service.getById(id);
            return ResponseEntity.ok(usuario);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value(), "Bad Request", Instant.now()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponseDTO("Usuário não encontrado.", HttpStatus.NOT_FOUND.value(), "Not Found", Instant.now()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Erro ao buscar usuário: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", Instant.now()));
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@RequestParam String email) {
        logger.info("Requisição para check-email recebida para o email: {}", email);
        boolean exists = service.findByEmail(email).isPresent();
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
}
