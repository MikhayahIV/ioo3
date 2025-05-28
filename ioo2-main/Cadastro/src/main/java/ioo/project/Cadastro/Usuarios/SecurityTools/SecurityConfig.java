package ioo.project.Cadastro.Usuarios.SecurityTools;

import ioo.project.Cadastro.Usuarios.SecurityTools.JWTFilter;
import ioo.project.Cadastro.Usuarios.SecurityTools.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig implements WebMvcConfigurer {

    private final UserDetailsServiceImpl userDetailsService;
    private final JWTFilter jwtFilter;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService, JWTFilter jwtFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Permite acesso público para o login e registro (APIs)
                        .requestMatchers("/api/auth/**").permitAll()

                        // Permite acesso às páginas HTML e recursos estáticos
                        .requestMatchers(
                                "/", "/index.html", "/conta.html", "/admin.html",
                                "/css/**", "/js/**", "/images/**", "/uploads/**", "/favicon.ico"
                        ).permitAll()

                        // APENAS ADMIN PODE ACESSAR AS APIS DE ADMIN
                        .requestMatchers("/api/admin/**").hasRole("ADMIN") // OU .hasAuthority("ROLE_ADMIN") dependendo do seu setup

                        // Usuários e admins podem acessar as APIs de usuários
                        .requestMatchers("/api/usuarios/**").hasAnyRole("USER", "ADMIN") // OU .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                        // Todas as outras requisições requerem autenticação
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class); // Seu JWTFilter aqui
        // .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(unauthorizedHandler)) // Se tiver
        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
                // --- APENAS RECURSOS ESTÁTICOS QUE DEVEM SER TOTALMENTE IGNORADOS PELO SPRING SECURITY ---
                // Se você tem arquivos HTML estáticos na raiz do seu frontend que são acessados diretamente
                // sem autenticação, como uma página inicial (ex: index.html), você pode incluí-los aqui.
                // Caso contrário, se são SPAs ou páginas que exigem login para serem exibidas,
                // é melhor gerenciá-las no frontend ou com permitAll() no securityFilterChain.
                "/", // Se sua rota raiz serve um index.html público
                "/index.html",
                "/conta.html", // Se conta.html for acessível a todos
                "/admin-dashboard.html", // Se admin-dashboard.html for acessível a todos sem login
                "/css/**",
                "/js/**",
                "/images/**",
                "/uploads/**",
                "/favicon.ico"
                // Remova quaisquer endpoints da API que você possa ter colocado aqui!
        );
    }

    @Bean
    public BCryptPasswordEncoder encoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider provider() {
        DaoAuthenticationProvider auth = new DaoAuthenticationProvider();
        auth.setUserDetailsService(userDetailsService);
        auth.setPasswordEncoder(encoder());
        return auth;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Override // Mantenha esta anotação
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapeia a URL /uploads/** para o diretório físico 'uploads/'
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/");
        // Garante que os recursos estáticos padrão (de src/main/resources/static) ainda são servidos
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }





}