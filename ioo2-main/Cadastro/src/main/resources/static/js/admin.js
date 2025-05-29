document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("jwtToken");
    const userId = localStorage.getItem("userId");
    let userRole = localStorage.getItem("userRole"); // Pode vir como "ROLE_ADMIN"

 setupPasswordToggle();
    // Processa a role para remover o prefixo se existir
    if (userRole && userRole.startsWith('ROLE_')) {
        userRole = userRole.substring(5); // Remove "ROLE_"
    }

    if (!token || !userId || isNaN(Number(userId)) || userRole !== 'ADMIN') {
        alert("Acesso negado. Você não está logado ou não tem permissão de administrador.");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        window.location.href = "index.html"; // Redireciona imediatamente
        return;
    }

    // --- Referências a Elementos HTML ---
    const userTableBody = document.querySelector("#userTable tbody");
    const adminSuccessMessage = document.getElementById("adminSuccessMessage");
    const adminErrorMessage = document.getElementById("adminErrorMessage");
    const addUserButton = document.getElementById("addUserButton");

    // Modal
    const userModal = document.getElementById("userModal");
    const closeUserModalButton = userModal ? userModal.querySelector(".close-button") : null;
    const modalTitle = document.getElementById("modalTitle");
    const userForm = document.getElementById("userForm");

    // Campos do formulário do modal
    const userIdInput = document.getElementById("userIdInput"); // Hidden field for ID
    const nomeInput = document.getElementById("nomeInput");
    const sobrenomeInput = document.getElementById("sobrenomeInput");
    const emailInput = document.getElementById("emailInput");
    const telefoneInput = document.getElementById("telefoneInput");
    const enderecoInput = document.getElementById("enderecoInput");
    const dataNascimentoInput = document.getElementById("dataNascimentoInput");
    const generoInput = document.getElementById("generoInput");
    const passwordInput = document.getElementById("passwordInput");
    const confirmPasswordInput = document.getElementById("confirmPasswordInput"); // ADICIONE ESTA LINHA
    const passwordGroup = document.getElementById("passwordGroup");
    const confirmPasswordGroup = document.getElementById("confirmPasswordGroup"); // ADICIONE ESTA LINHA
    const roleInput = document.getElementById("roleInput");

    // Mensagens de erro de campo no modal
    const nomeError = document.getElementById("nomeError");
    const sobrenomeError = document.getElementById("sobrenomeError");
    const emailError = document.getElementById("emailError");
    const telefoneError = document.getElementById("telefoneError");
    const enderecoError = document.getElementById("enderecoError");
    const dataNascimentoError = document.getElementById("dataNascimentoError");
    const generoError = document.getElementById("generoError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError"); // ADICIONE ESTA LINHA
    const roleError = document.getElementById("roleError")


    // --- Funções Auxiliares ---

    // Função para exibir mensagens na tela (sucesso ou erro)
    function displayMessage(element, message, type) {
        if (element) {
            element.textContent = message;
            element.className = `${type}-message`; // Adiciona classe para estilização
            setTimeout(() => { element.textContent = ''; element.className = ''; }, 5000); // Limpa após 5 segundos
        }
    }

    // Limpa todas as mensagens de erro do formulário do modal
    function clearModalErrors() {
        document.querySelectorAll('#userForm .error-message').forEach(p => p.textContent = '');
    }

    // Mapeamento de nomes de campos para exibição em erros (ex: "nome" para "Nome")
    const fieldNameMap = {
        nome: "Nome",
        sobrenome: "Sobrenome",
        email: "Email",
        telefone: "Telefone",
        endereco: "Endereço",
        dataNascimento: "Data de Nascimento",
        password: "Senha",
        role: "Role",
        genero: "Gênero"
    };

    // Exibe erros de validação retornados pelo backend no formulário do modal
    function displayFormErrors(errorResponse) {
        clearModalErrors();
        console.log("displayFormErrors recebido:", errorResponse);

        if (errorResponse.errors) {
            for (const fieldName in errorResponse.errors) {
                if (errorResponse.errors.hasOwnProperty(fieldName)) {
                    const errorElement = document.getElementById(`${fieldName}Error`);
                    if (errorElement) {
                        errorElement.textContent = errorResponse.errors[fieldName];
                    }
                }
            }
        }
        // Exibe mensagem geral se houver
        if (errorResponse.message) {
            displayMessage(adminErrorMessage, errorResponse.message, 'error');
        } else {
            displayMessage(adminErrorMessage, "Ocorreu um erro desconhecido.", 'error');
        }
    }


    // --- Verificação de Autenticação e Autorização ---
    if (!token || !userId || isNaN(Number(userId)) || userRole !== 'ADMIN') {
        alert("Acesso negado. Você não está logado ou não tem permissão de administrador.");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        window.location.href = "index.html"; // Redireciona para a página de login
        return; // Impede a execução do restante do script
    }

    // --- Funções do Modal ---
    function openUserModal(isEdit = false, userData = {}) {
        clearModalErrors(); // Limpa erros anteriores
        userForm.reset(); // Reseta o formulário


           passwordInput.placeholder = '';
            confirmPasswordInput.placeholder = '';

            if (isEdit) {
                modalTitle.textContent = "Editar Usuário";
                userIdInput.value = userData.id;
                nomeInput.value = userData.nome || '';
                sobrenomeInput.value = userData.sobrenome || '';
                emailInput.value = userData.email || '';
                telefoneInput.value = userData.telefone || '';
                enderecoInput.value = userData.endereco || '';
                dataNascimentoInput.value = userData.dataNascimento || ''; // Assume formato YYYY-MM-DD
                generoInput.value = userData.genero || '';
                roleInput.value = userData.role || 'ROLE_USER'; // Define a role atual

                // No modo de edição, os campos de senha são opcionais e usados APENAS para ALTERAR a senha.
                // É uma boa prática limpar seus valores para evitar vazamento acidental.
                passwordInput.value = '';
                confirmPasswordInput.value = '';

                // Remove o atributo 'required' para tornar a senha opcional na edição
                passwordInput.removeAttribute('required');
                confirmPasswordInput.removeAttribute('required');

                // Sugere ao usuário que deixe em branco para não alterar
                passwordInput.placeholder = 'Deixe em branco para manter a senha atual';
                confirmPasswordInput.placeholder = 'Deixe em branco para manter a senha atual';

                // Garante que os campos estejam visíveis, caso você os oculte em algum CSS default
                passwordGroup.style.display = 'block';
                confirmPasswordGroup.style.display = 'block';
        } else {
                modalTitle.textContent = "Adicionar Novo Usuário";
                userIdInput.value = ''; // Limpa o ID para um novo usuário

                // Para novo usuário, a senha é obrigatória
                passwordInput.value = '';
                confirmPasswordInput.value = '';
                passwordInput.setAttribute('required', 'required');
                confirmPasswordInput.setAttribute('required', 'required');

                // Garante que os campos estejam visíveis
                passwordGroup.style.display = 'block';
                confirmPasswordGroup.style.display = 'block';

                roleInput.value = 'ROLE_USER'; // Role padrão para novo usuário
            }
            userModal.style.display = "flex";
    }

    function closeUserModal() {
        userModal.style.display = "none";
        clearModalErrors();
        userForm.reset(); // Reseta o formulário ao fechar
    }

    // --- Funções de Carregamento e Manipulação de Usuários ---

    // Busca todos os usuários do backend
    async function fetchUsers() {
        try {
            const response = await fetch("http://localhost:8080/api/admin/usuarios", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401 || response.status === 403) {
                alert("Sua sessão expirou ou você não tem permissão de administrador. Faça login novamente.");
                localStorage.removeItem("jwtToken");
                localStorage.removeItem("userId");
                localStorage.removeItem("userRole");
                window.location.href = "index.html";
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || "Erro ao carregar usuários.");
            }

            const users = await response.json();
            renderUsers(users); // Renderiza os usuários na tabela
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            displayMessage(adminErrorMessage, "Erro ao carregar lista de usuários: " + error.message, 'error');
        }
    }

    // Renderiza a lista de usuários na tabela
    function renderUsers(users) {
        userTableBody.innerHTML = ''; // Limpa a tabela
        if (!users || users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="7">Nenhum usuário encontrado.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = userTableBody.insertRow();
            row.insertCell().textContent = user.id;
            row.insertCell().textContent = user.nome || 'N/A';
            row.insertCell().textContent = user.sobrenome || 'N/A';
            row.insertCell().textContent = user.email || 'N/A';
            row.insertCell().textContent = user.telefone || 'N/A';
            row.insertCell().textContent = user.role || 'N/A'; // Exibe a role do backend

            const actionsCell = row.insertCell();
            const editButton = document.createElement("button");
            editButton.textContent = "Editar";
            editButton.className = "btn btn-secondary btn-sm";
            editButton.addEventListener("click", () => openUserModal(true, user)); // Passa os dados do usuário
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Excluir";
            deleteButton.className = "btn btn-danger btn-sm ml-2"; // Adiciona uma margem
            deleteButton.addEventListener("click", () => confirmDeleteUser(user.id, user.nome));
            actionsCell.appendChild(deleteButton);
        });
    }

    // Confirmação para exclusão de usuário
    function confirmDeleteUser(id, nome) {
        if (confirm(`Tem certeza que deseja excluir o usuário ${nome} (ID: ${id})?`)) {
            deleteUser(id);
        }
    }

    // Deleta um usuário
    async function deleteUser(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/usuarios/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                alert("Sua sessão expirou ou você não tem permissão de administrador. Faça login novamente.");
                localStorage.removeItem("jwtToken");
                localStorage.removeItem("userId");
                localStorage.removeItem("userRole");
                window.location.href = "index.html";
                return;
            }

            if (response.ok || response.status === 204) { // 204 No Content para DELETE bem-sucedido
                displayMessage(adminSuccessMessage, "Usuário excluído com sucesso!", 'success');
                fetchUsers(); // Re-carrega a lista
            } else {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || "Erro ao excluir usuário.");
            }
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            displayMessage(adminErrorMessage, "Erro ao excluir usuário: " + error.message, 'error');
        }
    }

    // Adiciona ou Atualiza um usuário
    async function saveUser(event) {
        event.preventDefault();
        clearModalErrors(); // Limpa erros antes de validar e enviar

        const id = userIdInput.value; // Será vazio para adicionar, preenchido para editar
        const isEditMode = !!id; // True se houver um ID, false para novo usuário

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

            if (!isEditMode || (password.length > 0 || confirmPassword.length > 0)) {
                let hasPasswordError = false;

                // Limpa erros anteriores de senha para revalidar
                passwordError.textContent = '';
                confirmPasswordError.textContent = '';

                if (password !== confirmPassword) {
                    confirmPasswordError.textContent = 'As senhas não coincidem!';
                    hasPasswordError = true;
                }

                // Regras de validação da senha
                if (password.length > 0) { // Só valida se a senha foi digitada
                    if (password.length < 8) { // Mínimo de 8 caracteres
                        passwordError.textContent = 'A senha deve ter no mínimo 8 caracteres.';
                        hasPasswordError = true;
                    }

                    // Pelo menos um número
                    const hasNumber = /\d/.test(password);
                    if (!hasNumber) {
                        passwordError.textContent = (passwordError.textContent ? passwordError.textContent + ' ' : '') + 'A senha deve conter pelo menos um número.';
                        hasPasswordError = true;
                    }

                    // Pelo menos um caractere especial (adaptável, aqui considera alguns comuns)
                    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
                    if (!hasSpecialChar) {
                        passwordError.textContent = (passwordError.textContent ? passwordError.textContent + ' ' : '') + 'A senha deve conter pelo menos um caractere especial.';
                        hasPasswordError = true;
                    }
                } else if (!isEditMode) { // Para modo de criação, a senha é obrigatória e vazia é um erro
                    passwordError.textContent = 'A senha é obrigatória para novos usuários.';
                    hasPasswordError = true;
                }


                if (hasPasswordError) {
                    return; // Impede o envio do formulário se houver erro de senha
                }
            }

        const userData = {
                nome: nomeInput.value,
                sobrenome: sobrenomeInput.value,
                email: emailInput.value,
                telefone: telefoneInput.value,
                endereco: enderecoInput.value,
                dataNascimento: dataNascimentoInput.value,
                genero: generoInput.value,
                role: roleInput.value
        };

        let apiUrl = `http://localhost:8080/api/admin/usuarios`; // Note: "users" no plural, conforme seu Controller
        let httpMethod = "POST";

            if (isEditMode) {
                apiUrl = `http://localhost:8080/api/admin/usuarios/${id}`; // Note: "users"
                httpMethod = "PUT";
            } else {
                // Apenas para CRIAR usuário, adicione a senha ao DTO
                userData.senha = password; // Senha para o UsuarioCadastroDTO
                userData.confirmarSenha = confirmPassword; // Inclui para validação no backend
            }


            try {
                const response = await fetch(apiUrl, {
                    method: httpMethod,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(userData)
                });

                if (response.status === 401 || response.status === 403) {
                    alert("Sua sessão expirou ou você não tem permissão de administrador. Faça login novamente.");
                    localStorage.removeItem("jwtToken");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("userRole");
                    window.location.href = "index.html";
                    return;
                }

                if (response.ok) {
                    displayMessage(adminSuccessMessage, `Usuário ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso!`, 'success');
                    closeUserModal();
                    fetchUsers(); // Re-carrega a lista de usuários

                    // Se estiver no modo de edição e a senha foi preenchida,
                    // chame o endpoint de PATCH para alterar a senha
                    if (isEditMode && password.length > 0) {
                         // Chame o endpoint de alteração de senha
                        await updatePasswordForUser(id, password);
                    }

                } else {
                    const errorData = await response.json().catch(() => ({ message: response.statusText }));
                    console.error("Erro ao salvar usuário:", response.status, errorData);
                    displayFormErrors(errorData); // Usa a função para exibir erros do backend
                }
            } catch (error) {
                console.error("Erro de conexão ao salvar usuário:", error);
                displayMessage(adminErrorMessage, "Erro de conexão ao salvar usuário. Verifique sua rede.", 'error');
            }
    }




    async function updatePasswordForUser(userId, newPassword) {
        try {
            const response = await fetch(`/api/admin/users/${userId}/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ senha: newPassword }) // Seu SenhaUpdateDTO espera 'senha'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao alterar a senha.');
            }
            displayMessage(adminSuccessMessage, 'Senha do usuário atualizada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            // displayMessage(adminErrorMessage, error.message, 'error'); // Exibe erro específico da senha
            // Não retorna, pois a atualização de perfil pode ter sido bem-sucedida, apenas a senha falhou
        }
    }



    // --- Event Listeners ---





    // Botão para adicionar novo usuário
    if (addUserButton) {
        addUserButton.addEventListener("click", () => openUserModal(false));
    }

    // Botão para fechar o modal
    if (closeUserModalButton) {
        closeUserModalButton.addEventListener("click", closeUserModal);
    }

    // Fechar modal clicando fora
    window.addEventListener('click', (event) => {
        if (event.target === userModal) {
            closeUserModal();
        }
    });

    // Submissão do formulário do modal
    if (userForm) {
        userForm.addEventListener("submit", saveUser);
    }

    // --- Inicialização ---
    fetchUsers(); // Carrega os usuários ao carregar a página

    // Lógica de Logout (copiada do conta.js)
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

    // Lógica de Tema (assumindo que `toggleTheme` está em `utils.js`)
    const themeButton = document.getElementById("themeSwitcher");
    if (themeButton) {
      themeButton.addEventListener("click", toggleTheme);
    }
});