package ioo.project.Cadastro.Usuarios.Controllers;

import ioo.project.Cadastro.Usuarios.DTO.ErrorResponseDTO;
import ioo.project.Cadastro.Usuarios.DTO.LoginRequestDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioCadastroDTO;
import ioo.project.Cadastro.Usuarios.DTO.UsuarioResponseDTO;
import ioo.project.Cadastro.Usuarios.SecurityTools.JWTUtil;
import ioo.project.Cadastro.Usuarios.Services.AuthService;
import ioo.project.Cadastro.Usuarios.UsuariosRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;

    private final JWTUtil jwtUtil;

    private final AuthService authService;

    @Autowired
    private AuthService service;

    @Autowired
    private JWTUtil token;



    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody @Valid UsuarioCadastroDTO dto) {
        try {
            UsuarioResponseDTO responseDTO = authService.registrar(dto);
            // Retorna 201 Created em caso de sucesso no registro
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
        } catch (IllegalArgumentException e) {
            // Exemplo: se o AuthService lançar IllegalArgumentException para "email já registrado"
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.BAD_REQUEST.value(), "Bad Request", Instant.now()));
        } catch (RuntimeException e) {
            // Captura qualquer outra RuntimeException não específica
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponseDTO("Ocorreu um erro interno ao registrar: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", Instant.now()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO dto) {
        try {
            UsuarioResponseDTO responseDTO = authService.login(dto);
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) { // Idealmente, você teria uma exceção específica para credenciais inválidas
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // Status 401 Unauthorized
                    .body(new ErrorResponseDTO(e.getMessage(), HttpStatus.UNAUTHORIZED.value(), "Unauthorized", Instant.now()));
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }


}
