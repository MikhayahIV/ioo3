package ioo.project.Cadastro.Usuarios.SecurityTools;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException; // Importe esta exceção
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import org.slf4j.Logger; // Importe o Logger
import org.slf4j.LoggerFactory; // Importe o LoggerFactory

@Component
public class JWTFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JWTFilter.class); // Inicialize o Logger

    private final JWTUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    public JWTFilter(JWTUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");

        String email = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                email = jwtUtil.extractUsername(jwt);
                logger.info("Email extraído do token JWT: {}", email); // LOG CRÍTICO AQUI!
            } catch (Exception e) {
                // Logar o erro se a extração do email falhar (token inválido, etc.)
                logger.error("Erro ao extrair email do token JWT: {}", e.getMessage());
            }
        }

        // Se o email foi extraído e não há autenticação no contexto de segurança
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Tenta carregar os detalhes do usuário
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // Valida o token contra os detalhes do usuário
                // Se jwtUtil.isValid(jwt) não verifica a expiração, considere usar jwtUtil.validateToken(jwt, userDetails)
                // Assumindo que jwtUtil.isValid(jwt) é suficiente por enquanto.
                if (jwtUtil.isValid(jwt)) { // Ou jwtUtil.validateToken(jwt, userDetails)
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("Usuário '{}' autenticado com sucesso.", email);
                } else {
                    logger.warn("Token JWT inválido para o usuário '{}'.", email);
                }
            } catch (UsernameNotFoundException e) {
                // Captura especificamente quando o usuário não é encontrado
                logger.warn("Usuário não encontrado no banco de dados para o email no token: {}", email);
            } catch (Exception e) {
                // Captura outras exceções durante o processo de autenticação JWT
                logger.error("Erro inesperado durante a validação ou autenticação do token JWT: {}", e.getMessage(), e);
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Este método é crucial! Ele decide se o filtro deve ser aplicado ou não.
        // Se ele retornar TRUE para /api/auth/registrar, o JWTFilter não será executado.
        // Isso é o que você quer para o registro, pois não há token JWT ainda.
        return request.getRequestURI().startsWith("/api/auth/registrar") ||
                request.getRequestURI().startsWith("/api/auth/login") ||
                request.getRequestURI().startsWith("/api/usuarios/check-email");
    }
}
