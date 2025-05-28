package ioo.project.Cadastro.Usuarios.SecurityTools;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
@Service
public class JWTUtil {


    @Value("${jwt.secret}")
    private String secretString; // Nome para a string bruta da chave

    @Value("${jwt.expiration}")
    private long expirationTime; // Nome mais claro para o tempo de expiração

    // 2. A chave secreta real, inicializada uma única vez
    private SecretKey signingKey;

    // 3. Método para inicializar a chave após a injeção das propriedades
    @PostConstruct
    public void init() {
        this.signingKey = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, Long userId, String userRole) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("role", userRole)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime)) // Use expirationTime
                .signWith(signingKey, SignatureAlgorithm.HS512) // <--- Corrigido: Usando a SecretKey inicializada
                .compact();
    }

    // Método auxiliar para extrair todas as claims (reutilizado)
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey) // <--- Usando a SecretKey inicializada
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }


    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject(); // Reutiliza extractAllClaims
    }

    public boolean isValid(String token) {
        try {
            extractAllClaims(token); // Tenta extrair as claims, se der erro, captura a exceção
            return true;
        } catch (JwtException e) {
            // Logar a exceção para depuração seria uma boa prática aqui
            System.err.println("Token inválido ou expirado: " + e.getMessage());
            return false;
        }
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Verificar se o token não está expirado também
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        final Date expiration = extractAllClaims(token).getExpiration();
        return expiration.before(new Date());
    }
}
