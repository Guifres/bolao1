// Referências do DOM
const form = document.getElementById("form-palpites");
const listaResultados = document.getElementById("lista-resultados");

// Função para registrar o palpite
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Impede o comportamento padrão do formulário

  // Pegando os valores de nome e telefone
  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;

  // Obtendo os valores dos inputs de gols para os palpites
  const palpites = [
    {
      time1: 'Juventude',
      gols_time1: document.getElementById("time1-gols").value,
      time2: 'Vitória',
      gols_time2: document.getElementById("time2-gols").value,
    },
    {
      time1: 'Grêmio',
      gols_time1: document.getElementById("time3-gols").value,
      time2: 'Atlético-MG',
      gols_time2: document.getElementById("time4-gols").value,
    },
    {
      time1: 'Cruzeiro',
      gols_time1: document.getElementById("time5-gols").value,
      time2: 'Mirassol',
      gols_time2: document.getElementById("time6-gols").value,
    },
    {
      time1: 'Botafogo',
      gols_time1: document.getElementById("time7-gols").value,
      time2: 'Palmeiras',
      gols_time2: document.getElementById("time8-gols").value,
    },
    {
      time1: 'Bahia',
      gols_time1: document.getElementById("time9-gols").value,
      time2: 'Corinthians',
      gols_time2: document.getElementById("time10-gols").value,
    },
    {
      time1: 'Fortaleza',
      gols_time1: document.getElementById("time11-gols").value,
      time2: 'Fluminense',
      gols_time2: document.getElementById("time12-gols").value,
    },
    {
      time1: 'São Paulo',
      gols_time1: document.getElementById("time13-gols").value,
      time2: 'Sport Recife',
      gols_time2: document.getElementById("time14-gols").value,
    },
    {
      time1: 'Flamengo',
      gols_time1: document.getElementById("time15-gols").value,
      time2: 'Internacional',
      gols_time2: document.getElementById("time16-gols").value,
    },
    {
      time1: 'Santos',
      gols_time1: document.getElementById("time17-gols").value,
      time2: 'Vasco da Gama',
      gols_time2: document.getElementById("time18-gols").value,
    },
    {
      time1: 'Ceará',
      gols_time1: document.getElementById("time19-gols").value,
      time2: 'Bragantino',
      gols_time2: document.getElementById("time20-gols").value,
    },
  ];

  // Dados a serem enviados ao backend
  const dados = {
    nome,
    telefone,
    palpites
  };

  try {
    const response = await fetch("http://localhost:5000/palpites/registrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Palpite registrado com sucesso!");
      form.reset();  // Limpa o formulário após o envio
      getResultados();  // Atualiza a lista de resultados
    } else {
      alert("Erro ao registrar palpite. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro na comunicação com o servidor.");
  }
});

// Função para buscar os vencedores
async function obterVencedores() {
  try {
      const response = await fetch('http://localhost:5000/palpites/vencedores');
      const data = await response.json();

      // Exibe os dados para verificação
      console.log('Dados recebidos:', data);

      const vencedoresDiv = document.getElementById('vencedores');
      const erroDiv = document.getElementById('erro');
      vencedoresDiv.innerHTML = '';  // Limpar o conteúdo anterior
      erroDiv.innerHTML = ''; // Limpar erro anterior

      if (data && Array.isArray(data.vencedores) && data.vencedores.length > 0) {
          data.vencedores.forEach(vencedor => {
              const vencedorDiv = document.createElement('div');
              vencedorDiv.classList.add('vencedor');
              vencedorDiv.innerHTML = `
                  <span><strong>Nome:</strong> ${vencedor.nome}</span><br>
                  <span><strong>Pontos:</strong> ${vencedor.pontos}</span><hr>
              `;
              vencedoresDiv.appendChild(vencedorDiv);
          });
      } else {
          erroDiv.innerHTML = 'Nenhum vencedor encontrado.';
      }
  } catch (error) {
      console.error('Erro ao obter vencedores:', error);
      document.getElementById('erro').innerHTML = 'Erro ao obter os vencedores. Tente novamente mais tarde.';
  }
}

// Chama a função quando o conteúdo da página for carregado
document.addEventListener('DOMContentLoaded', obterVencedores);




