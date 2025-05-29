document.addEventListener("DOMContentLoaded", function() {
  const token = localStorage.getItem("jwtToken");
  let userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

console.log("Variáveis do localStorage no conta.js:");
  console.log("token:", token);
  console.log("userId:", userId);
  console.log("userRole:", userRole);
  console.log("Tipo de userId:", typeof userId);
  console.log("userRole é 'USER' ou 'ADMIN'?", userRole === 'USER' || userRole === 'ADMIN');

  let currentEmailOnLoad = '';


  const themeButton = document.getElementById("themeSwitcher");
  if (themeButton) {
    themeButton.addEventListener("click", toggleTheme);
  } else {
    console.warn("Elemento 'themeSwitcher' não encontrado no DOM.");
  }


  setupPasswordToggle();

  if (!token || !userId || userId === "null" || userId === "undefined" || (userRole !== 'ROLE_USER' && userRole !== 'ROLE_ADMIN')) {
    alert("Você não está logado, sua sessão expirou ou não tem permissão para acessar esta página. Por favor, faça login.");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
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
     dataNascimento: "Data de Nascimento",
     senhaAtual: "Senha Atual",
     novaSenha: "Nova Senha",
     confirmarNovaSenha: "Confirmar Nova Senha",
     genero: "Gênero"
   };

   function displayFormErrors(errorResponse, formId) {
     clearFormMessages();
     console.log("displayFormErrors recebido:", errorResponse, "para o formulário:", formId);
     const generalErrorElement = document.getElementById('profileEditError');
     let hasFieldErrors = false;
     let detailedGeneralMessage = "Por favor, corrija os seguintes erros: \n";


     if (errorResponse.errors) {
       for (const fieldName in errorResponse.errors) {
         if (errorResponse.errors.hasOwnProperty(fieldName)) {
           hasFieldErrors = true;
           const errorElementId = `edit${capitalizeFirstLetter(fieldName)}Error`;
           const errorElement = document.getElementById(errorElementId);
           if (errorElement) {
             errorElement.textContent = errorResponse.errors[fieldName];
           }
           const displayFieldName = fieldNameMap[fieldName] || capitalizeFirstLetter(fieldName);
           detailedGeneralMessage += `- ${displayFieldName}: ${errorResponse.errors[fieldName]}\n`;
         }
       }
     }

     if (generalErrorElement) {
       if (hasFieldErrors) {
         generalErrorElement.textContent = detailedGeneralMessage;
       } else if (errorResponse.message) {
         generalErrorElement.textContent = errorResponse.message;
       } else if (typeof errorResponse === 'string') {
         generalErrorElement.textContent = errorResponse;
       } else {
         generalErrorElement.textContent = "Ocorreu um erro inesperado ao atualizar o perfil.";
       }
     }
   }

  const passwordModal = document.getElementById("passwordModal");
  const changePasswordButton = document.getElementById("changePasswordButton");
  const closePasswordModalButton = document.querySelector("#passwordModal .close-button");
  const changePasswordForm = document.getElementById("changePasswordForm");
  const passwordChangeError = document.getElementById("passwordChangeError");

  const currentPasswordInput = document.getElementById("currentPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmNewPasswordInput = document.getElementById("confirmNewPassword");

  const editProfileModal = document.getElementById("editProfileModal");
  const editProfileButton = document.getElementById("editProfileButton");
  const closeEditProfileModalButton = document.querySelector("#editProfileModal .close-button");
  const editProfileForm = document.getElementById("editProfileForm");
  const profileEditError = document.getElementById("profileEditError");

  const editNomeInput = document.getElementById("editNome");
  const editSobrenomeInput = document.getElementById("editSobrenome");
  const editEmailInput = document.getElementById("editEmail");
  const editTelefoneInput = document.getElementById("editTelefone");
  const editEnderecoInput = document.getElementById("editEndereco");
  const editDataNascimentoInput = document.getElementById("editDataNascimento");
  const editGeneroSelect = document.getElementById("editGenero");

  const profilePictureInput = document.getElementById("profilePictureInput");
  const changePhotoButton = document.getElementById("changePhotoButton");
  const deleteAccountButton = document.getElementById("deleteAccountButton");


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

  if (changePasswordButton) {
    changePasswordButton.addEventListener("click", openPasswordModal);
  }
  if (closePasswordModalButton) {
    closePasswordModalButton.addEventListener("click", closePasswordModal);
  }


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



  if (changePasswordForm) {
      changePasswordForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        document.getElementById('currentPasswordError').textContent = "";
        document.getElementById('newPasswordError').textContent = "";
        document.getElementById('confirmNewPasswordError').textContent = "";
        document.getElementById('passwordChangeError').textContent = "";

        const senhaAtual = currentPasswordInput ? currentPasswordInput.value : '';
        const novaSenha = newPasswordInput ? newPasswordInput.value : '';
        const confirmarNovaSenha = confirmNewPasswordInput ? confirmNewPasswordInput.value : '';

        let hasFrontendErrors = false;

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
            document.getElementById('passwordChangeError').textContent = "Por favor, corrija os erros nos campos de senha.";
            return;
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

                   if (errorData.errors) {
                          displayFormErrors(errorData, 'changePasswordForm');
                   } else if (errorData.message) {
                          document.getElementById('passwordChangeError').textContent = errorData.message;
                          console.log("Mensagem de erro geral da API definida:", errorData.message);
                   } else {
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

      console.log("Debug Email Check (antes do trim):");
      console.log("newEmail:", newEmail);
      console.log("currentEmailOnLoad:", currentEmailOnLoad);
      console.log("newEmail === currentEmailOnLoad:", newEmail === currentEmailOnLoad);
      console.log("newEmail !== currentEmailOnLoad:", newEmail !== currentEmailOnLoad);
      console.log("São iguais após trim?", newEmail.trim() === currentEmailOnLoad.trim());

      if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
          displayFormErrors({ errors: { email: "Formato de email inválido. Ex: usuario@dominio.com" }, message: "Erro de validação." }, 'editProfileForm');
          return;
      }

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
                   const responseData = await response.json();
                   const updatedUser = responseData.usuario;
                   const newToken = responseData.token;

                   localStorage.setItem('jwtToken', newToken);

                   token = newToken;


                   alert("Perfil atualizado com sucesso!");
                   closeEditProfileModal();

                   fetchUserData();

          } else {
              const errorData = await response.json().catch(() => ({ message: "Erro desconhecido ao atualizar perfil." }));
              console.error("Erro ao atualizar perfil:", response.status, errorData);
              isplayFormErrors(errorData, 'editProfileForm');

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

   function fetchUserData() {
     console.log("Fetching user data for userId:", userId);
     console.log("Type of userId:", typeof userId);
     console.log("Value of userId:", userId);
     console.log("User Role:", userRole);

     if (!userId || isNaN(Number(userId))) {
         console.error("userId inválido ou ausente para fetchUserData:", userId);
         alert("ID de usuário inválido. Por favor, faça login novamente.");
         localStorage.removeItem("jwtToken");
         localStorage.removeItem("userId");
         localStorage.removeItem("userRole");
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
         localStorage.removeItem("userRole");
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
       currentEmailOnLoad = userData.email ? userData.email.trim() : '';

       const userTelefoneElem = document.getElementById("userTelefone");
       if (userTelefoneElem) userTelefoneElem.innerText = userData.telefone || 'N/A';

       const userEnderecoElem = document.getElementById("userEndereco");
       if (userEnderecoElem) userEnderecoElem.innerText = userData.endereco || 'N/A';

       const userDataNascimentoElem = document.getElementById("userDataNascimento");
       if (userDataNascimentoElem) {
         if (userData.dataNascimento) {
           const date = new Date(userData.dataNascimento);
           userDataNascimentoElem.innerText = date.toLocaleDateString('pt-BR');
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

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", function() {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      alert("Você foi desconectado.");
      window.location.href = "index.html";
    });
  }

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
      console.log("URL da imagem recebida do backend:", imageUrl);
      const profilePhotoElement = document.getElementById("profilePhoto");
      if (profilePhotoElement) {
        profilePhotoElement.src = imageUrl;
      }
      fetchUserData();
    })
    .catch(error => {
      console.error("Erro ao fazer upload da foto:", error);
      alert("Erro ao fazer upload da foto: " + error.message);
    });
  }

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
        localStorage.removeItem("userRole");
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

window.onload = () => {
  if (document.body) {
    document.body.classList.add("light");
  }
};