function toggleTheme() {
  if (document.body) {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
  }
}

function setupPasswordToggle() {
  const togglePasswordElements = document.querySelectorAll('.toggle-password');

  togglePasswordElements.forEach(function(toggleElement) {
    toggleElement.addEventListener('click', function() {
      const targetId = this.dataset.target;
      const passwordInput = document.getElementById(targetId);

      if (passwordInput && passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.textContent = '🙈'; 
        this.classList.add('visible');
      } else if (passwordInput) {
        passwordInput.type = 'password';
        this.textContent = '👁️';
        this.classList.remove('visible');
      }
    });
  });
}


function getJwtToken() {
    return localStorage.getItem('jwtToken');
}

function getUserId() {
    return localStorage.getItem('userId');
}

function getUserRole() {
    return localStorage.getItem('userRole');
}

function clearAuthData() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
}


async function makeAuthenticatedRequest(url, method = 'GET', body = null, isFormData = false) {
    const token = getJwtToken();

    if (!token) {
        console.error('Token JWT não encontrado. O usuário não está logado.');
        alert('Sessão expirada ou acesso negado. Por favor, faça login novamente.');
        window.location.href = 'index.html';
        throw new Error('Não autenticado');
    }

    const headers = {
        'Authorization': `Bearer ${token}`
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 403) {
        console.error(`Erro de autenticação/autorização: ${response.status}`);
        alert('Sessão expirada ou acesso negado. Por favor, faça login novamente.');
        clearAuthData();
        window.location.href = 'index.html';
        throw new Error('Não autorizado ou proibido');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ou formato de resposta inválido.' }));
        throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }


    if (url.includes('/foto') && method === 'POST') {
        return response.text();
    }
    return response.json();
}