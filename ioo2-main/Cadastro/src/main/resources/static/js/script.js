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

    const loginErrorElement = document.getElementById("loginError");
    if (loginErrorElement) loginErrorElement.textContent = '';
    const registerErrorElement = document.getElementById("registerError");
    if (registerErrorElement) registerErrorElement.textContent = '';
}

function displayErrors(errors, formId) {
    clearAllErrors();

    for (const fieldName in errors) {
        if (errors.hasOwnProperty(fieldName)) {
            const errorElementId = formId === 'login-form' ? `login${capitalizeFirstLetter(fieldName)}Error` : `reg${capitalizeFirstLetter(fieldName)}Error`;
            const errorElement = document.getElementById(errorElementId);
            if (errorElement) {
                errorElement.textContent = errors[fieldName];
            } else {
                const generalErrorElement = document.getElementById(`${formId === 'login-form' ? 'loginError' : 'registerError'}`);
                if (generalErrorElement) {
                     generalErrorElement.textContent += (generalErrorElement.textContent ? '\n' : '') + errors[fieldName];
                } else {
                    console.warn(`Elemento de erro para '${errorElementId}' ou erro geral para '${formId}' não encontrado.`);
                }
            }
        }
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function login() {
  clearAllErrors();

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
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userRole', data.role);
        alert("Login bem-sucedido! Bem-vindo, " + (data.nome || 'usuário'));

        if (data.role === 'ROLE_ADMIN') {
          window.location.href = "admin.html";
       } else if (data.role === 'ROLE_USER') {
          window.location.href = "conta.html";
        } else {
          console.warn("Role de usuário desconhecida:", data.role);
          localStorage.clear();
          loginErrorElement.textContent = "Role de usuário inválida. Por favor, entre em contato com o suporte.";
        }

      } else {
        console.error("Login bem-sucedido, mas o token não foi recebido:", data);
        alert("Login bem-sucedido, mas o token não foi recebido. Tente novamente.");
        window.location.href = "index.html";
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


async function register() {
  const nome = document.getElementById("regNome").value;
  const sobrenome = document.getElementById("regSobrenome").value;
  const email = document.getElementById("regEmail").value;
  const senha = document.getElementById("regSenha").value;
  const senhaConfirm = document.getElementById("regSenhaConfirm").value;
  const telefone = document.getElementById("regTelefone").value;
  const endereco = document.getElementById("regEndereco").value;
  const dataNascimento = document.getElementById("regNascimento").value;
  const generoinput = document.getElementById("regGenero").value;
  const genero = generoinput ? generoinput.toUpperCase() : null;

  clearAllErrors();

  if (senha !== senhaConfirm) {
    document.getElementById("regSenhaConfirmError").innerText = "As senhas não coincidem.";
    return;
  }
  if (!dataNascimento) {
    document.getElementById("regNascimentoError").innerText = "A data de nascimento não pode estar vazia.";
    return;
  }
  const regEmailErrorElement = document.getElementById("regEmailError");
  if (!email) {
      regEmailErrorElement.innerText = "O campo de e-mail não pode ser vazio.";
      return;
  }

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
        localStorage.setItem('userRole', data.role);
        alert("Cadastro e Login bem-sucedidos! Bem-vindo, " + (data.nome || 'usuário'));
        window.location.href = "conta.html";
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


  const themeButton = document.getElementById("themeSwitcher");
  if (themeButton && typeof toggleTheme === 'function') {
    themeButton.addEventListener("click", toggleTheme);
  } else if (themeButton) {
    console.warn("Elemento 'themeSwitcher' encontrado, mas a função 'toggleTheme' não está disponível.");
  }

  if (typeof setupPasswordToggle === 'function') {
    setupPasswordToggle();
  } else {
    console.warn("A função 'setupPasswordToggle' não está disponível.");
  }
});


window.onload = () => {
  if (document.body) {
    document.body.classList.add("light");
  }
};


