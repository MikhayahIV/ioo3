package ioo.project.Cadastro.Usuarios.Config;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção personalizada para indicar que um email já existe no sistema.
 * Retorna um status HTTP 409 Conflict.
 */
@ResponseStatus(HttpStatus.CONFLICT) // Define o status HTTP 409 Conflict para esta exceção
public class EmailAlreadyExistsException extends RuntimeException {

    /**
     * Construtor que recebe uma mensagem de erro.
     * @param message A mensagem detalhada do erro.
     */
    public EmailAlreadyExistsException(String message) {
        super(message);
    }

    /**
     * Construtor que recebe uma mensagem de erro e uma causa.
     * @param message A mensagem detalhada do erro.
     * @param cause A causa raiz da exceção.
     */
    public EmailAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
