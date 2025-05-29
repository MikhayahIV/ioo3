document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("jwtToken");
    const userId = localStorage.getItem("userId");
    let userRole = localStorage.getItem("userRole");

 setupPasswordToggle();
    if (userRole && userRole.startsWith('ROLE_')) {
        userRole = userRole.substring(5);
    }

    if (!token || !userId || isNaN(Number(userId)) || userRole !== 'ADMIN') {
        alert("Acesso negado. Você não está logado ou não tem permissão de administrador.");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        window.location.href = "index.html";
        return;
    }

    const userTableBody = document.querySelector("#userTable tbody");
    const adminSuccessMessage = document.getElementById("adminSuccessMessage");
    const adminErrorMessage = document.getElementById("adminErrorMessage");
    const addUserButton = document.getElementById("addUserButton");

    const userModal = document.getElementById("userModal");
    const closeUserModalButton = userModal ? userModal.querySelector(".close-button") : null;
    const modalTitle = document.getElementById("modalTitle");
    const userForm = document.getElementById("userForm");

    const userIdInput = document.getElementById("userIdInput");
    const nomeInput = document.getElementById("nomeInput");
    const sobrenomeInput = document.getElementById("sobrenomeInput");
    const emailInput = document.getElementById("emailInput");
    const telefoneInput = document.getElementById("telefoneInput");
    const enderecoInput = document.getElementById("enderecoInput");
    const dataNascimentoInput = document.getElementById("dataNascimentoInput");
    const generoInput = document.getElementById("generoInput");
    const passwordInput = document.getElementById("passwordInput");
    const confirmPasswordInput = document.getElementById("confirmPasswordInput");
    const passwordGroup = document.getElementById("passwordGroup");
    const confirmPasswordGroup = document.getElementById("confirmPasswordGroup");
    const roleInput = document.getElementById("roleInput");

    const nomeError = document.getElementById("nomeError");
    const sobrenomeError = document.getElementById("sobrenomeError");
    const emailError = document.getElementById("emailError");
    const telefoneError = document.getElementById("telefoneError");
    const enderecoError = document.getElementById("enderecoError");
    const dataNascimentoError = document.getElementById("dataNascimentoError");
    const generoError = document.getElementById("generoError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    const roleError = document.getElementById("roleError")

    function displayMessage(element, message, type) {
        if (element) {
            element.textContent = message;
            element.className = `${type}-message`;
            setTimeout(() => { element.textContent = ''; element.className = ''; }, 5000);
        }
    }

    function clearModalErrors() {
        document.querySelectorAll('#userForm .error-message').forEach(p => p.textContent = '');
    }

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
        if (errorResponse.message) {
            displayMessage(adminErrorMessage, errorResponse.message, 'error');
        } else {
            displayMessage(adminErrorMessage, "Ocorreu um erro desconhecido.", 'error');
        }
    }


    if (!token || !userId || isNaN(Number(userId)) || userRole !== 'ADMIN') {
        alert("Acesso negado. Você não está logado ou não tem permissão de administrador.");
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        window.location.href = "index.html";
        return;
    }

    function openUserModal(isEdit = false, userData = {}) {
        clearModalErrors();
        userForm.reset();

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
                dataNascimentoInput.value = userData.dataNascimento || '';
                generoInput.value = userData.genero || '';
                roleInput.value = userData.role || 'ROLE_USER';

                passwordInput.value = '';
                confirmPasswordInput.value = '';

                passwordInput.removeAttribute('required');
                confirmPasswordInput.removeAttribute('required');

                passwordInput.placeholder = 'Deixe em branco para manter a senha atual';
                confirmPasswordInput.placeholder = 'Deixe em branco para manter a senha atual';

                passwordGroup.style.display = 'block';
                confirmPasswordGroup.style.display = 'block';
        } else {
                modalTitle.textContent = "Adicionar Novo Usuário";
                userIdInput.value = '';

                passwordInput.value = '';
                confirmPasswordInput.value = '';
                passwordInput.setAttribute('required', 'required');
                confirmPasswordInput.setAttribute('required', 'required');

                passwordGroup.style.display = 'block';
                confirmPasswordGroup.style.display = 'block';

                roleInput.value = 'ROLE_USER';
            }
            userModal.style.display = "flex";
    }

    function closeUserModal() {
        userModal.style.display = "none";
        clearModalErrors();
        userForm.reset();
    }

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
            renderUsers(users);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            displayMessage(adminErrorMessage, "Erro ao carregar lista de usuários: " + error.message, 'error');
        }
    }

    function renderUsers(users) {
        userTableBody.innerHTML = '';
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
            row.insertCell().textContent = user.role || 'N/A';

            const actionsCell = row.insertCell();
            const editButton = document.createElement("button");
            editButton.textContent = "Editar";
            editButton.className = "btn btn-secondary btn-sm";
            editButton.addEventListener("click", () => openUserModal(true, user));
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Excluir";
            deleteButton.className = "btn btn-danger btn-sm ml-2";
            deleteButton.addEventListener("click", () => confirmDeleteUser(user.id, user.nome));
            actionsCell.appendChild(deleteButton);
        });
    }

    function confirmDeleteUser(id, nome) {
        if (confirm(`Tem certeza que deseja excluir o usuário ${nome} (ID: ${id})?`)) {
            deleteUser(id);
        }
    }

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

            if (response.ok || response.status === 204) {
                displayMessage(adminSuccessMessage, "Usuário excluído com sucesso!", 'success');
                fetchUsers();
            } else {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || "Erro ao excluir usuário.");
            }
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            displayMessage(adminErrorMessage, "Erro ao excluir usuário: " + error.message, 'error');
        }
    }

    async function saveUser(event) {
        event.preventDefault();
        clearModalErrors();

        const id = userIdInput.value;
        const isEditMode = !!id;

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

            if (!isEditMode || (password.length > 0 || confirmPassword.length > 0)) {
                let hasPasswordError = false;

                passwordError.textContent = '';
                confirmPasswordError.textContent = '';

                if (password !== confirmPassword) {
                    confirmPasswordError.textContent = 'As senhas não coincidem!';
                    hasPasswordError = true;
                }

                if (password.length > 0) {
                    if (password.length < 8) {
                        passwordError.textContent = 'A senha deve ter no mínimo 8 caracteres.';
                        hasPasswordError = true;
                    }

                    const hasNumber = /\d/.test(password);
                    if (!hasNumber) {
                        passwordError.textContent = (passwordError.textContent ? passwordError.textContent + ' ' : '') + 'A senha deve conter pelo menos um número.';
                        hasPasswordError = true;
                    }

                    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
                    if (!hasSpecialChar) {
                        passwordError.textContent = (passwordError.textContent ? passwordError.textContent + ' ' : '') + 'A senha deve conter pelo menos um caractere especial.';
                        hasPasswordError = true;
                    }
                } else if (!isEditMode) {
                    passwordError.textContent = 'A senha é obrigatória para novos usuários.';
                    hasPasswordError = true;
                }

                if (hasPasswordError) {
                    return;
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
                userData.senha = password;
                userData.confirmarSenha = confirmPassword;
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
                    fetchUsers();


                    if (isEditMode && password.length > 0) {

                        await updatePasswordForUser(id, password);
                    }

                } else {
                    const errorData = await response.json().catch(() => ({ message: response.statusText }));
                    console.error("Erro ao salvar usuário:", response.status, errorData);
                    displayFormErrors(errorData);
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
                body: JSON.stringify({ senha: newPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao alterar a senha.');
            }
            displayMessage(adminSuccessMessage, 'Senha do usuário atualizada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
        }
    }


    if (addUserButton) {
        addUserButton.addEventListener("click", () => openUserModal(false));
    }

    if (closeUserModalButton) {
        closeUserModalButton.addEventListener("click", closeUserModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === userModal) {
            closeUserModal();
        }
    });

    if (userForm) {
        userForm.addEventListener("submit", saveUser);
    }

    fetchUsers();

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

    const themeButton = document.getElementById("themeSwitcher");
    if (themeButton) {
      themeButton.addEventListener("click", toggleTheme);
    }
});