package ioo.project.Cadastro.Usuarios.Controllers;

import ioo.project.Cadastro.Usuarios.DTO.*;
import ioo.project.Cadastro.Usuarios.Models.Role;
import ioo.project.Cadastro.Usuarios.Services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }


    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioResponseDTO>> getAllUsers() {
        List<UsuarioResponseDTO> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/usuarios/paged")
    public ResponseEntity<Page<UsuarioResponseDTO>> getAllUsersPaged(Pageable pageable) {
        Page<UsuarioResponseDTO> usersPage = adminService.getAllUsersPaged(pageable);
        return ResponseEntity.ok(usersPage);
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UsuarioResponseDTO user = adminService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.NOT_FOUND.value(), "Not Found", Instant.now()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Erro ao buscar usuário: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", Instant.now()));
        }
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> createNewUser(@RequestBody @Valid UsuarioCadastroDTO dto,
                                           @RequestParam(name = "role", defaultValue = "ROLE_USER") Role role) {
        try {
            UsuarioResponseDTO newUser = adminService.createNewUser(dto, role);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value(), "Bad Request", Instant.now()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Erro ao criar usuário: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", Instant.now()));
        }
    }

    @PutMapping("/usuarios/{id}") // CONFIRME QUE ESTE ENDPOINT EXISTE E ESTÁ CORRETO
    public ResponseEntity<?> updateAnyUserProfile(@PathVariable Long id, @RequestBody @Valid UsuarioUpdateDTO dto) {
        try {
            UsuarioResponseDTO updatedUser = adminService.updateAnyUserProfile(id, dto);
            return ResponseEntity.ok(updatedUser);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.NOT_FOUND.value(), "Not Found", Instant.now()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value(), "Bad Request", Instant.now()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Erro ao atualizar o perfil do usuário: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", Instant.now()));
        }
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> deleteAnyUser(@PathVariable Long id) {
        try {
            adminService.deleteAnyUser(id);
            return ResponseEntity.ok("Usuário excluído com sucesso.");
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.NOT_FOUND.value(), "Not Found", Instant.now()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Erro ao deletar usuário: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", Instant.now()));
        }
    }

    @PatchMapping("/users/{id}/password")
    public ResponseEntity<?> updateUserPassword(@PathVariable Long id, @RequestBody @Valid SenhaUpdateDTO passwordDto) {
        try {
            UsuarioResponseDTO updatedUser = adminService.updateUserPassword(id, passwordDto);
            return ResponseEntity.ok(updatedUser);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.NOT_FOUND.value(), "Not Found", Instant.now()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value(), "Bad Request", Instant.now()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Erro ao atualizar a senha do usuário: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", Instant.now()));
        }
    }
}