document.addEventListener("DOMContentLoaded", function() {
  const token = localStorage.getItem("jwtToken");
  let userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole"); // User role adicionado aqui!

console.log("Variáveis do localStorage no conta.js:");
  console.log("token:", token);
  console.log("userId:", userId);
  console.log("userRole:", userRole);
  console.log("Tipo de userId:", typeof userId);
  console.log("userRole é 'USER' ou 'ADMIN'?", userRole === 'USER' || userRole === 'ADMIN');

  let currentEmailOnLoad = '';

  // --- Elementos Comuns e Lógica de Tema ---
  const themeButton = document.getElementById("themeSwitcher");
  if (themeButton) {
    themeButton.addEventListener("click", toggleTheme); // Chama a função global de utils.js
  } else {
    console.warn("Elemento 'themeSwitcher' não encontrado no DOM.");
  }

  // A função toggleTheme é definida em utils.js, não aqui.
  // REMOVA QUALQUER DEFINIÇÃO DE 'function toggleTheme() { ... }' DAQUI.

  // --- Lógica de Toggle de Senha ---
  setupPasswordToggle(); // Chama a função global de utils.js

  // --- Lógica de Login e Redirecionamento (Verificação Inicial) ---
  // A verificação inicial agora inclui a role do usuário.
  if (!token || !userId || userId === "null" || userId === "undefined" || (userRole !== 'ROLE_USER' && userRole !== 'ROLE_ADMIN')) {
    alert("Você não está logado, sua sessão expirou ou não tem permissão para acessar esta página. Por favor, faça login.");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole"); // Remove userRole também
    window.location.href = "index.html";
    return;
  }

  function clearFormMessages() {
      document.querySelectorAll('#editProfileForm .error-message').forEach(p => p.textContent = '');
      const successMessageElem = document.getElementById('updateSuccessMessage');
      if (successMessageElem) successMessageElem.textContent = '';
      const generalErrorElem = document.getElementById('updateGeneralError');
      if (generalErrorElem) generalErrorElem.textContent = '';
      const profileEditErrorElem = document.getElementById('profileEditError');
      if (profileEditErrorElem) profileEditErrorElem.textContent = '';
      const passwordChangeErrorElem = document.getElementById('passwordChangeError');
      if (passwordChangeErrorElem) passwordChangeErrorElem.textContent = '';
    }

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

  const fieldNameMap = {
     nome: "Nome",
     sobrenome: "Sobrenome",
     email: "Email",
     telefone: "Telefone",
     endereco: "Endereço",
     dataNascimento: "Data de Nascimento", // Mapeamento adicionado
     senhaAtual: "Senha Atual", // Adicionado para validação de senha
     novaSenha: "Nova Senha", // Adicionado para validação de senha
     confirmarNovaSenha: "Confirmar Nova Senha", // Adicionado para validação de senha
     genero: "Gênero"
   };

   function displayFormErrors(errorResponse, formId) {
     clearFormMessages();
     console.log("displayFormErrors recebido:", errorResponse, "para o formulário:", formId);

     const generalErrorElement = document.getElementById('profileEditError');
     let hasFieldErrors = false;
     let detailedGeneralMessage = "Por favor, corrija os seguintes erros: \n"; // Inicia com uma mensagem mais específica

     // Exibe erros específicos por campo, se existirem (do GlobalExceptionHandler)
     if (errorResponse.errors) { // Verifica se existe o mapa 'errors'
       for (const fieldName in errorResponse.errors) {
         if (errorResponse.errors.hasOwnProperty(fieldName)) {
           hasFieldErrors = true;
           const errorElementId = `edit${capitalizeFirstLetter(fieldName)}Error`;
           const errorElement = document.getElementById(errorElementId);
           if (errorElement) {
             errorElement.textContent = errorResponse.errors[fieldName];
           }
           // Usa o mapeamento para obter o nome amigável do campo
           const displayFieldName = fieldNameMap[fieldName] || capitalizeFirstLetter(fieldName);
           detailedGeneralMessage += `- ${displayFieldName}: ${errorResponse.errors[fieldName]}\n`;
         }
       }
     }

     // Define a mensagem geral com base na existência de erros específicos
     if (generalErrorElement) {
       if (hasFieldErrors) {
         // Se há erros de campo, a mensagem geral é a concatenação detalhada
         generalErrorElement.textContent = detailedGeneralMessage;
       } else if (errorResponse.message) {
         // Se não há erros de campo, mas há uma mensagem geral do backend (ex: email já existe)
         generalErrorElement.textContent = errorResponse.message;
       } else if (typeof errorResponse === 'string') {
         // Caso raro de resposta não-JSON (fallback)
         generalErrorElement.textContent = errorResponse;
       } else {
         // Mensagem genérica se nada mais se aplicar
         generalErrorElement.textContent = "Ocorreu um erro inesperado ao atualizar o perfil.";
       }
     }
   }

  // --- Elementos do Modal de Alteração de Senha ---
  const passwordModal = document.getElementById("passwordModal");
  const changePasswordButton = document.getElementById("changePasswordButton");
  const closePasswordModalButton = document.querySelector("#passwordModal .close-button");
  const changePasswordForm = document.getElementById("changePasswordForm");
  const passwordChangeError = document.getElementById("passwordChangeError");

  const currentPasswordInput = document.getElementById("currentPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmNewPasswordInput = document.getElementById("confirmNewPassword");

  // --- Elementos do Modal de Edição de Perfil ---
  const editProfileModal = document.getElementById("editProfileModal");
  const editProfileButton = document.getElementById("editProfileButton");
  const closeEditProfileModalButton = document.querySelector("#editProfileModal .close-button");
  const editProfileForm = document.getElementById("editProfileForm");
  const profileEditError = document.getElementById("profileEditError");

  const editNomeInput = document.getElementById("editNome");
  const editSobrenomeInput = document.getElementById("editSobrenome"); // CORRIGIDO AQUI!
  const editEmailInput = document.getElementById("editEmail");
  const editTelefoneInput = document.getElementById("editTelefone");
  const editEnderecoInput = document.getElementById("editEndereco");
  const editDataNascimentoInput = document.getElementById("editDataNascimento");
  const editGeneroSelect = document.getElementById("editGenero");

  // --- Elementos para Foto de Perfil e Exclusão ---
  const profilePictureInput = document.getElementById("profilePictureInput");
  const changePhotoButton = document.getElementById("changePhotoButton");
  const deleteAccountButton = document.getElementById("deleteAccountButton");


  // --- Funções para o Modal de Senha ---
  function openPasswordModal() {
    if (passwordModal) {
       clearFormMessages();
      passwordModal.style.display = "flex";
    }
  }

  function closePasswordModal() {
    if (passwordModal) {
      passwordModal.style.display = "none";
    }
    if (changePasswordForm) {
      changePasswordForm.reset();
    }
    clearFormMessages();
  }

  // --- Funções para o Modal de Edição de Perfil ---
  function openEditProfileModal(userData) {
    if (editProfileModal) {
      if (editNomeInput) editNomeInput.value = userData.nome || '';
      if (editSobrenomeInput) editSobrenomeInput.value = userData.sobrenome || '';
      if (editEmailInput) editEmailInput.value = userData.email || '';
      if (editTelefoneInput) editTelefoneInput.value = userData.telefone || '';
      if (editEnderecoInput) editEnderecoInput.value = userData.endereco || '';
      if (editDataNascimentoInput) {
        if (userData.dataNascimento) {
          const date = new Date(userData.dataNascimento);
          editDataNascimentoInput.value = date.toISOString().split('T')[0];
        } else {
          editDataNascimentoInput.value = '';
        }
      }
      if (editGeneroSelect) editGeneroSelect.value = userData.genero || '';

      editProfileModal.style.display = "flex";
    }
  }

  function closeEditProfileModal() {
    if (editProfileModal) {
      editProfileModal.style.display = "none";
    }
    if (editProfileForm) {
      editProfileForm.reset();
    }
    clearFormMessages();
  }

  // --- Event Listeners para o Modal de Senha ---
  if (changePasswordButton) {
    changePasswordButton.addEventListener("click", openPasswordModal);
  }
  if (closePasswordModalButton) {
    closePasswordModalButton.addEventListener("click", closePasswordModal);
  }


  // --- Event Listeners para o Modal de Edição de Perfil ---
  if (editProfileButton) {
    editProfileButton.addEventListener("click", function() {
      fetchUserData().then(userData => {
        if (userData) {
          openEditProfileModal(userData);
        }
      });
    });
  }
  if (closeEditProfileModalButton) {
    closeEditProfileModalButton.addEventListener("click", closeEditProfileModal);
  }



  // --- Lógica de Alteração de Senha ---
  if (changePasswordForm) {
      changePasswordForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Limpa todas as mensagens de erro específicas e gerais antes de novas validações
        document.getElementById('currentPasswordError').textContent = "";
        document.getElementById('newPasswordError').textContent = "";
        document.getElementById('confirmNewPasswordError').textContent = "";
        document.getElementById('passwordChangeError').textContent = "";

        const senhaAtual = currentPasswordInput ? currentPasswordInput.value : '';
        const novaSenha = newPasswordInput ? newPasswordInput.value : '';
        const confirmarNovaSenha = confirmNewPasswordInput ? confirmNewPasswordInput.value : '';

        let hasFrontendErrors = false;

        // Validações de frontend para senha
        if (!senhaAtual) {
            document.getElementById('currentPasswordError').textContent = "A senha atual não pode estar vazia.";
            hasFrontendErrors = true;
        }
        if (!novaSenha) {
            document.getElementById('newPasswordError').textContent = "A nova senha não pode estar vazia.";
            hasFrontendErrors = true;
        } else if (novaSenha.length < 8) {
            document.getElementById('newPasswordError').textContent = "A nova senha deve ter pelo menos 8 caracteres.";
            hasFrontendErrors = true;
        } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).*$/.test(novaSenha)) {
            document.getElementById('newPasswordError').textContent = "A nova senha deve conter pelo menos um número e um caractere especial.";
            hasFrontendErrors = true;
        }

        if (novaSenha !== confirmarNovaSenha) {
          document.getElementById('confirmNewPasswordError').textContent = "As novas senhas não coincidem.";
          hasFrontendErrors = true;
        }

        if (hasFrontendErrors) {
            // Exibe uma mensagem geral se houver erros de frontend
            document.getElementById('passwordChangeError').textContent = "Por favor, corrija os erros nos campos de senha.";
            return; // Interrompe a submissão se houver erros de frontend
        }

        try {
            const response = await fetch(`http://localhost:8080/api/usuarios/${userId}/senha`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    senhaAtual: senhaAtual,
                    novaSenha: novaSenha
                })
            });

            if (response.ok) {
                 alert("Senha atualizada com sucesso!");
                 closePasswordModal();
            } else {
                   const errorData = await response.json().catch(() => ({ message: "Erro desconhecido ao atualizar senha." }));
                   console.error("Erro ao atualizar senha:", response.status, errorData);

                          // MODIFICAÇÃO AQUI: Trata a mensagem de erro geral do backend
                   if (errorData.errors) { // Se houver erros específicos por campo (validação @Valid)
                          displayFormErrors(errorData, 'changePasswordForm');
                   } else if (errorData.message) { // Se houver uma mensagem de erro geral (como "Senha atual incorreta.")
                          document.getElementById('passwordChangeError').textContent = errorData.message;
                          console.log("Mensagem de erro geral da API definida:", errorData.message);
                   } else { // Fallback para estrutura de erro inesperada
                          document.getElementById('passwordChangeError').textContent = "Ocorreu um erro inesperado ao atualizar a senha.";
                          console.log("Mensagem de erro inesperado definida.");
                          }
                   }
        } catch (error) {
             console.error("Erro de conexão ao atualizar senha:", error);
             document.getElementById('passwordChangeError').textContent = "Erro de conexão ao atualizar senha. Verifique sua rede.";
        }
      });
  }

  // --- Lógica de Submissão do Formulário de Edição de Perfil ---
if (editProfileForm) {
    editProfileForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const newNome = editNomeInput ? editNomeInput.value : '';
      const newSobrenome = editSobrenomeInput ? editSobrenomeInput.value : '';
      const newEmail = editEmailInput ? editEmailInput.value : '';
      const newTelefone = editTelefoneInput ? editTelefoneInput.value : '';
      const newEndereco = editEnderecoInput ? editEnderecoInput.value : '';
      const newDataNascimento = editDataNascimentoInput ? editDataNascimentoInput.value : '';
      const newGenero = editGeneroSelect ? editGeneroSelect.value : '';

      clearFormMessages();

      // Debug logs para verificar os valores antes da comparação
      console.log("Debug Email Check (antes do trim):");
      console.log("newEmail:", newEmail);
      console.log("currentEmailOnLoad:", currentEmailOnLoad);
      console.log("newEmail === currentEmailOnLoad:", newEmail === currentEmailOnLoad);
      console.log("newEmail !== currentEmailOnLoad:", newEmail !== currentEmailOnLoad);
      console.log("São iguais após trim?", newEmail.trim() === currentEmailOnLoad.trim());


      // Validação de formato de email no frontend (primeira camada)
      if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
          displayFormErrors({ errors: { email: "Formato de email inválido. Ex: usuario@dominio.com" }, message: "Erro de validação." }, 'editProfileForm');
          return;
      }

      // Validação de email duplicado (se o email foi alterado)
      // Usar .trim() para remover espaços em branco e garantir comparação precisa
      if (newEmail.trim() && newEmail.trim() !== currentEmailOnLoad.trim()) {
          try {
              const checkEmailResponse = await fetch(`http://localhost:8080/api/usuarios/check-email?email=${encodeURIComponent(newEmail.trim())}`);
              if (!checkEmailResponse.ok) {
                  const errorData = await checkEmailResponse.json().catch(() => ({ message: "Erro desconhecido ao verificar e-mail." }));
                  console.error("Erro ao verificar email para atualização:", checkEmailResponse.status, errorData);
                  displayFormErrors(errorData, 'editProfileForm');
                  return;
              }
              const checkEmailData = await checkEmailResponse.json();
              if (checkEmailData.exists) {
                  displayFormErrors({ errors: { email: "Este e-mail já está em uso por outro usuário." }, message: "Erro de validação." }, 'editProfileForm');
                  return;
              }
          } catch (err) {
              console.error("Erro na requisição de verificação de email para atualização:", err);
              displayFormErrors({ message: "Problema de conexão ao verificar o novo e-mail." }, 'editProfileForm');
              return;
          }
      }

      const updatedData = {
        nome: newNome,
        sobrenome: newSobrenome,
        email: newEmail,
        telefone: newTelefone,
        endereco: newEndereco,
        dataNascimento: newDataNascimento,
        genero: newGenero
      };

      try {
          const response = await fetch(`http://localhost:8080/api/usuarios/${userId}`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(updatedData)
          });

           if (response.ok) {
                   const responseData = await response.json(); // Isso agora é PerfilAtualizadoResponse
                   const updatedUser = responseData.usuario; // Os dados atualizados do usuário
                   const newToken = responseData.token; // O NOVO token JWT

                      // 1. ATUALIZAR O LOCALSTORAGE COM O NOVO TOKEN
                   localStorage.setItem('jwtToken', newToken);

                      // 2. ATUALIZAR AS VARIÁVEIS GLOBAIS/MODULARES NO JAVASCRIPT
                      // Se o email foi alterado, o ID do usuário não muda, mas se o token foi
                      // gerado com base no email, o token precisa ser substituído.
                      // A variável 'token' global também deve ser atualizada para futuras chamadas
                   token = newToken; // Importante para que futuras chamadas usem o novo token
                      // userId = updatedUser.id; // Raramente o ID muda, então esta linha geralmente não é necessária
                      // userRole = updatedUser.role; // Atualize a role se ela puder mudar via este endpoint

                   alert("Perfil atualizado com sucesso!"); // A mensagem de sucesso do próprio fluxo
                   closeEditProfileModal();

                      // 3. RECARRERGAR OS DADOS NA INTERFACE DO USUÁRIO
                      // fetchUserData() vai agora usar o NOVO token e o userId correto
                   fetchUserData(); // Esta função vai recarregar os dados na tela

          } else {
                      // ... lógica de erro se a atualização falhar ...
              const errorData = await response.json().catch(() => ({ message: "Erro desconhecido ao atualizar perfil." }));
              console.error("Erro ao atualizar perfil:", response.status, errorData);
              isplayFormErrors(errorData, 'editProfileForm');

                      // Se o erro foi 401 ou 403 na TENTATIVA DE ATUALIZAÇÃO,
                      // então a sessão REALMENTE expirou/não tem permissão, e aí sim você desloga.
                  if (response.status === 401 || response.status === 403) {
                       let("Sua sessão expirou ou você não tem permissão para atualizar o perfil. Faça login novamente.");
                       localStorage.removeItem("jwtToken");
                       localStorage.removeItem("userId");
                       localStorage.removeItem("userRole");
                       window.location.href = "index.html";
                  }
          }
      } catch (error) {
          console.error("Erro de conexão ao atualizar perfil:", error);
          document.getElementById('profileEditError').textContent = "Erro de conexão ao atualizar perfil. Verifique sua rede.";
      }
    });
  }

   // --- Lógica de Carregamento de Dados do Usuário ---
   function fetchUserData() {
     console.log("Fetching user data for userId:", userId);
     console.log("Type of userId:", typeof userId);
     console.log("Value of userId:", userId);
     console.log("User Role:", userRole); // Log do userRole

     if (!userId || isNaN(Number(userId))) {
         console.error("userId inválido ou ausente para fetchUserData:", userId);
         alert("ID de usuário inválido. Por favor, faça login novamente.");
         localStorage.removeItem("jwtToken");
         localStorage.removeItem("userId");
         localStorage.removeItem("userRole"); // Remove userRole
         window.location.href = "index.html";
         return Promise.reject("ID de usuário inválido.");
     }

     return fetch(`http://localhost:8080/api/usuarios/${userId}`, {
       method: "GET",
       headers: {
         "Authorization": "Bearer " + token,
         "Content-Type": "application/json"
       }
     })
     .then(res => {
       if (res.status === 401 || res.status === 403) {
         alert("Sua sessão expirou ou você não tem permissão. Faça login novamente.");
         localStorage.removeItem("jwtToken");
         localStorage.removeItem("userId");
         localStorage.removeItem("userRole"); // Remove userRole
         window.location.href = "index.html";
         return Promise.reject("Sessão expirada/não autorizada");
       }
       if (!res.ok) {
         throw new Error("Erro ao carregar dados do usuário.");
       }
       return res.json();
     })
     .then(userData => {
       console.log("Dados do usuário recebidos:", userData);
       const userNameElem = document.getElementById("userName");
       if (userNameElem) userNameElem.innerText = userData.nome || 'N/A';

       const userSobrenomeElem = document.getElementById("userSobrenome");
       if (userSobrenomeElem) userSobrenomeElem.innerText = userData.sobrenome || 'N/A';

       const userEmailElem = document.getElementById("userEmail");
       if (userEmailElem) userEmailElem.innerText = userData.email || 'N/A';
       // Armazena o email original, removendo espaços em branco
       currentEmailOnLoad = userData.email ? userData.email.trim() : '';

       const userTelefoneElem = document.getElementById("userTelefone");
       if (userTelefoneElem) userTelefoneElem.innerText = userData.telefone || 'N/A';

       const userEnderecoElem = document.getElementById("userEndereco");
       if (userEnderecoElem) userEnderecoElem.innerText = userData.endereco || 'N/A';

       const userDataNascimentoElem = document.getElementById("userDataNascimento");
       if (userDataNascimentoElem) {
         if (userData.dataNascimento) {
           const date = new Date(userData.dataNascimento);
           userDataNascimentoElem.innerText = date.toLocaleDateString('pt-BR'); // Formata para DD/MM/AAAA
         } else {
           userDataNascimentoElem.innerText = 'N/A';
         }
       }

       const userGeneroElem = document.getElementById("userGenero");
       if (userGeneroElem) userGeneroElem.innerText = userData.genero || 'N/A';

       const profilePhotoElement = document.getElementById("profilePhoto");
       if (profilePhotoElement && userData.foto && typeof userData.foto === 'string') {
         profilePhotoElement.src = userData.foto;
       } else if (profilePhotoElement) {
         profilePhotoElement.src = "https://placehold.co/120x120/aabbcc/ffffff?text=Foto";
       }
       return userData;
     })
     .catch(err => {
       console.error("Erro ao carregar dados:", err);
       if (!err.message.includes("Sessão expirada")) {
         alert("Ocorreu um erro ao carregar seus dados. Tente novamente.");
       }
       return null;
     });
   }

   fetchUserData();

  // --- Lógica de Logout ---
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function() {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole"); // Remover a role também
      alert("Você foi desconectado.");
      window.location.href = "index.html";
    });
  }

  // --- Lógica para Alterar Foto de Perfil ---
  if (changePhotoButton && profilePictureInput) {
    changePhotoButton.addEventListener("click", function() {
      profilePictureInput.click();
    });

    profilePictureInput.addEventListener("change", function() {
      const file = this.files[0];
      if (file) {
        uploadProfilePicture(file);
      }
    });
  }

  function uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append("file", file);

    fetch(`http://localhost:8080/api/usuarios/${userId}/foto`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    })
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        return response.text().then(text => { throw new Error(text) });
      }
    })
    .then(imageUrl => {
      alert("Foto de perfil atualizada com sucesso!");
      console.log("URL da imagem recebida do backend:", imageUrl); // NOVO LOG
      const profilePhotoElement = document.getElementById("profilePhoto");
      if (profilePhotoElement) {
        profilePhotoElement.src = imageUrl;
      }
      fetchUserData(); // Re-carrega os dados para garantir que a URL da foto seja atualizada
    })
    .catch(error => {
      console.error("Erro ao fazer upload da foto:", error);
      alert("Erro ao fazer upload da foto: " + error.message);
    });
  }

  // --- Lógica para Excluir Usuário ---
  if (deleteAccountButton) {
    deleteAccountButton.addEventListener("click", function() {
      if (confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) {
        deleteUserAccount();
      }
    });
  }

  function deleteUserAccount() {
    fetch(`http://localhost:8080/api/usuarios/${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.ok) {
        alert("Sua conta foi excluída com sucesso.");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole"); // Remove userRole
        window.location.href = "index.html";
      } else {
        return response.text().then(text => { throw new Error(text) });
      }
    })
    .catch(error => {
      console.error("Erro ao excluir conta:", error);
      alert("Erro ao excluir conta: " + error.message);
    });
  }
});

// Este window.onload deve estar FORA do DOMContentLoaded para não ser sobrescrito
window.onload = () => {
  if (document.body) {
    document.body.classList.add("light");
  }
};