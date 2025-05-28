package ioo.project.Cadastro.Usuarios.SecurityTools;

import ioo.project.Cadastro.Usuarios.Models.UsuariosModel;
import ioo.project.Cadastro.Usuarios.UsuariosRepository;
import ioo.project.Cadastro.Usuarios.UsuariosRepository;
import ioo.project.Cadastro.Usuarios.Models.UsuariosModel;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuariosRepository repository;

    public UserDetailsServiceImpl(UsuariosRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UsuariosModel usuario = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        String roleFromDatabase = usuario.getRole().name(); // Pegue a role diretamente do seu modelo UsuarioModel

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getSenha())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(roleFromDatabase))) // Use .authorities()
                .build();
    }
}