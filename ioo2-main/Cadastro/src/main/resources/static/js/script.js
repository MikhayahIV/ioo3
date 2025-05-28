// Este arquivo é o seu script.js, que contém as funções login() e register().

// Certifique-se de que as funções toggleTheme e setupPasswordToggle
// estão definidas em um arquivo utils.js que é carregado ANTES deste script no HTML.

function toggleForms() {
  const login = document.getElementById("login-form");
  const register = document.getElementById("register-form");
  login.style.display = login.style.display === "none" ? "block" : "none";
  register.style.display = register.style.display === "none" ? "block" : "none";
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(p => {
        p.textContent = '';
    });
    // Limpa erros gerais
    const loginErrorElement = document.getElementById("loginError");
    if (loginErrorElement) loginErrorElement.textContent = '';
    const registerErrorElement = document.getElementById("registerError");
    if (registerErrorElement) registerErrorElement.textContent = '';
}

function displayErrors(errors, formId) {
    clearAllErrors(); // Limpa todos os erros antes de exibir novos

    for (const fieldName in errors) {
        if (errors.hasOwnProperty(fieldName)) {
            // Constrói o ID do elemento p de erro. Ex: 'regEmailError' para o campo 'email'
            // ou 'loginEmailError' para o campo 'email' no formulário de login
            const errorElementId = formId === 'login-form' ? `login${capitalizeFirstLetter(fieldName)}Error` : `reg${capitalizeFirstLetter(fieldName)}Error`;
            const errorElement = document.getElementById(errorElementId);
            if (errorElement) {
                errorElement.textContent = errors[fieldName];
            } else {
                // Se não encontrar um p específico (por exemplo, erro global ou de campo não mapeado)
                const generalErrorElement = document.getElementById(`${formId === 'login-form' ? 'loginError' : 'registerError'}`);
                if (generalErrorElement) {
                     // Adiciona a mensagem, pode ser útil para erros que não mapeiam para campos específicos
                     generalErrorElement.textContent += (generalErrorElement.textContent ? '\n' : '') + errors[fieldName];
                } else {
                    console.warn(`Elemento de erro para '${errorElementId}' ou erro geral para '${formId}' não encontrado.`);
                }
            }
        }
    }
}


// Função auxiliar para capitalizar a primeira letra (útil para IDs de elementos)
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function login() {
  clearAllErrors(); // Limpa todos os erros antes de uma nova tentativa de login

  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;
  const loginErrorElement = document.getElementById("loginError");

  try {
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        // --- ADIÇÃO CRÍTICA AQUI ---
        // 1. Armazenar o token JWT
        localStorage.setItem('jwtToken', data.token);
        // 2. Armazenar o ID do usuário (já estava)
        localStorage.setItem('userId', data.id);
        // 3. Armazenar a ROLE do usuário (NOVA ADIÇÃO)
        localStorage.setItem('userRole', data.role); // Assumindo que 'data.role' contém a string da role (ex: "ADMIN", "USER")
        // --- FIM DA ADIÇÃO CRÍTICA ---

        alert("Login bem-sucedido! Bem-vindo, " + (data.nome || 'usuário'));

        // --- LÓGICA DE REDIRECIONAMENTO BASEADA NA ROLE (NOVA ADIÇÃO) ---
        if (data.role === 'ROLE_ADMIN') {
          window.location.href = "admin.html"; // Redireciona para a tela de admin
       } else if (data.role === 'ROLE_USER') { // <--- Boa prática adicionar a verificação explícita para USER também
          window.location.href = "conta.html";
        } else {
          // Caso a role não seja reconhecida ou seja algo inesperado
          console.warn("Role de usuário desconhecida:", data.role);
          localStorage.clear(); // Limpa as credenciais por segurança
          loginErrorElement.textContent = "Role de usuário inválida. Por favor, entre em contato com o suporte.";
        }
        // --- FIM DA LÓGICA DE REDIRECIONAMENTO ---

      } else {
        console.error("Login bem-sucedido, mas o token não foi recebido:", data);
        alert("Login bem-sucedido, mas o token não foi recebido. Tente novamente.");
        window.location.href = "index.html"; // Redireciona para o login
      }
    } else {
      console.error("Resposta do backend não OK no login:", res);
      let errorData = null;
      let messageToDisplay = "Erro ao conectar com o servidor de login.";

      try {
        errorData = await res.json();
        console.error("Dados de erro do backend no login:", errorData);
      } catch (jsonParseError) {
        console.error("Erro ao parsear JSON da resposta de erro. Resposta pode ser não-JSON ou vazia.", jsonParseError);
        errorData = { message: "Resposta do servidor não é JSON válida." };
      }

      if (res.status === 401) {
          messageToDisplay = (errorData && errorData.message) ? errorData.message : "Email ou senha inválidos.";
      } else if (res.status === 400) {
          if (errorData && errorData.errors) {
              displayErrors(errorData.errors, 'login-form');
              messageToDisplay = "Por favor, verifique os campos do formulário.";
          } else {
              messageToDisplay = (errorData && errorData.message) ? errorData.message : "Dados inválidos. Verifique seu email e senha.";
          }
      } else {
          messageToDisplay = (errorData && errorData.message) ? errorData.message : `Erro ${res.status}: Ocorreu um problema no servidor.`;
      }

      loginErrorElement.textContent = messageToDisplay;
    }
  } catch (networkError) {
    console.error("Erro na requisição de login (erro de rede/não tratado):", networkError);
    loginErrorElement.textContent = "Erro ao conectar com o servidor de login. Verifique sua conexão.";
  }
}


async function register() { // FUNÇÃO AGORA É ASYNC
  const nome = document.getElementById("regNome").value;
  const sobrenome = document.getElementById("regSobrenome").value;
  const email = document.getElementById("regEmail").value;
  const senha = document.getElementById("regSenha").value;
  const senhaConfirm = document.getElementById("regSenhaConfirm").value;
  const telefone = document.getElementById("regTelefone").value;
  const endereco = document.getElementById("regEndereco").value;
  const dataNascimento = document.getElementById("regNascimento").value;
  const generoinput = document.getElementById("regGenero").value;
  const genero = generoinput ? generoinput.toUpperCase() : null; // Garante que é null se não selecionado

  clearAllErrors(); // Limpa mensagens de erro anteriores de todos os campos

  // 1. Validações básicas do lado do cliente (sincronas)
  if (senha !== senhaConfirm) {
    document.getElementById("regSenhaConfirmError").innerText = "As senhas não coincidem.";
    return;
  }
  if (!dataNascimento) {
    document.getElementById("regNascimentoError").innerText = "A data de nascimento não pode estar vazia.";
    return;
  }
  const regEmailErrorElement = document.getElementById("regEmailError");
  if (!email) { // Verifica se o campo de email está vazio
      regEmailErrorElement.innerText = "O campo de e-mail não pode ser vazio.";
      return;
  }

  // 2. Verificação de email existente (assíncrona)
  try {
    const checkEmailResponse = await fetch(`http://localhost:8080/api/usuarios/check-email?email=${encodeURIComponent(email)}`);

    if (!checkEmailResponse.ok) {
        const errorText = await checkEmailResponse.text();
        console.error("Erro ao verificar email (check-email endpoint):", errorText);
        regEmailErrorElement.innerText = "Erro ao verificar e-mail. Tente novamente.";
        return;
    }

    const checkEmailData = await checkEmailResponse.json();
    if (checkEmailData.exists) {
        regEmailErrorElement.innerText = "Este e-mail já está cadastrado.";
        return;
    }

  } catch (err) {
    console.error("Erro na requisição de verificação de email:", err);
    regEmailErrorElement.innerText = "Problema de conexão ao verificar e-mail. Tente novamente.";
    return;
  }

  // 3. Se todas as validações anteriores passaram, prossegue com o cadastro principal
  const userData = {
      nome, sobrenome, email, senha, telefone, endereco, dataNascimento, genero
  };

  try {
    const res = await fetch("http://localhost:8080/api/auth/registrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('userId', data.id);
        // --- NOVA ADIÇÃO AQUI ---
        // Salva a role do usuário no localStorage
        localStorage.setItem('userRole', data.role); // Assumindo que 'data.role' contém a string da role
        // --- FIM DA NOVA ADIÇÃO ---
        alert("Cadastro e Login bem-sucedidos! Bem-vindo, " + (data.nome || 'usuário'));
        window.location.href = "conta.html"; // Redireciona para conta.html
      } else {
        console.error("Token não recebido na resposta de registro:", data);
        alert("Cadastro bem-sucedido, mas o token não foi recebido. Faça login manualmente.");
        window.location.href = "index.html";
      }
    } else {
      console.error("Resposta do backend não OK no registro:", res);
      const errorData = await res.json();
      console.error("Dados de erro do backend no registro:", errorData);

      if (res.status === 409) {
          displayErrors(errorData, 'register-form');
      } else if (res.status === 400) {
          displayErrors(errorData, 'register-form');
      } else {
          document.getElementById("registerError").innerText = errorData.message || "Erro no cadastro. Tente novamente.";
      }
    }
  } catch (err) {
    console.error("Erro na requisição de registro (final catch):", err);
    document.getElementById("registerError").innerText = "Erro ao se conectar. Verifique sua conexão ou tente novamente mais tarde.";
  }
}


document.addEventListener("DOMContentLoaded", function() {
  // As funções toggleTheme e setupPasswordToggle devem ser definidas globalmente em utils.js
  // e utils.js deve ser carregado ANTES deste script no HTML.

  const themeButton = document.getElementById("themeSwitcher");
  if (themeButton && typeof toggleTheme === 'function') { // Verifica se toggleTheme existe
    themeButton.addEventListener("click", toggleTheme);
  } else if (themeButton) {
    console.warn("Elemento 'themeSwitcher' encontrado, mas a função 'toggleTheme' não está disponível.");
  }

  if (typeof setupPasswordToggle === 'function') { // Verifica se setupPasswordToggle existe
    setupPasswordToggle();
  } else {
    console.warn("A função 'setupPasswordToggle' não está disponível.");
  }
});

// Este window.onload deve estar FORA do DOMContentLoaded para não ser sobrescrito
// e deve ser o único window.onload ou usar addEventListener para não sobrescrever
window.onload = () => {
  if (document.body) {
    document.body.classList.add("light");
  }
};


