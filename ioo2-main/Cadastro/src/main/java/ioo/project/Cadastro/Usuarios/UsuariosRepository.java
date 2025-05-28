package ioo.project.Cadastro.Usuarios;

import ioo.project.Cadastro.Usuarios.Models.UsuariosModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuariosRepository extends JpaRepository<UsuariosModel,Long> {
    Optional<UsuariosModel> findByEmail(String email);
    boolean existsByEmail(String email);
}
