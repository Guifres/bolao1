// Referências do DOM
const form = document.getElementById("form-palpites");
const listaResultados = document.getElementById("lista-resultados");

// Função para registrar o palpite
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Impede o comportamento padrão do formulário

  // pegando os valores de nome telefone
  const nome = document.getElementById('nome').value
  const telefone = document.getElementById('telefone').value

  // Obtendo os valores dos inputs de gols
  const palpites = [
    {
      Juventude: document.getElementById("time1-gols").value,
      ECVitoria: document.getElementById("time2-gols").value,
    },
    {
      Gremio: document.getElementById("time3-gols").value,
      AtleticoMg: document.getElementById("time4-gols").value,
    },
    {
      Cruzeiro: document.getElementById("time5-gols").value,
      Mirasol: document.getElementById("time6-gols").value,
    },
    {
      Palmeiras: document.getElementById("time7-gols").value,
      Botafogo: document.getElementById("time8-gols").value,
    },{
      Bahia: document.getElementById("time9-gols").value,
      Corinthians: document.getElementById("time10-gols").value,
    },
    {
      Fortaleza: document.getElementById("time11-gols").value,
      Fluminense: document.getElementById("time12-gols").value,
    },
    {
      SaoPaulo: document.getElementById("time13-gols").value,
      SportRecife: document.getElementById("time14-gols").value,
    },
    {
      Flamengo: document.getElementById("time15-gols").value,
      Internacional: document.getElementById("time16-gols").value,
    },{
      VascodaGama: document.getElementById("time17-gols").value,
      Santos: document.getElementById("time18-gols").value,
    },
    {
      Bragantino: document.getElementById("time19-gols").value,
      CearaSC: document.getElementById("time20-gols").value,
    },
  ];

  // Enviar dados para o backend

  const dados = {
    nome,
    telefone,
    palpites,
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
      form.reset();
      getResultados(); // Atualiza a lista de resultados
    } else {
      alert("Erro ao registrar palpite. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro na comunicação com o servidor.");
  }
});

// Função para buscar os resultados
async function obterVencedores() {
  try {
      const response = await fetch('http://localhost:5000/palpites/vencedores');
      const data = await response.json();
      
      const vencedoresDiv = document.getElementById('vencedores');
      vencedoresDiv.innerHTML = '';  // Limpar o conteúdo anterior

      if (data.vencedores.length > 0) {
          data.vencedores.forEach(vencedor => {
              const vencedorDiv = document.createElement('div');
              vencedorDiv.classList.add('vencedor');
              vencedorDiv.innerHTML = `
                  <span><strong>Nome:</strong> ${vencedor.nome}</span>
                  <span><strong>Telefone:</strong> ${vencedor.telefone}</span>
                  <span><strong>Pontos:</strong> ${vencedor.pontos}</span>
              `;
              vencedoresDiv.appendChild(vencedorDiv);
          });
      } else {
          vencedoresDiv.innerHTML = '<p>Nenhum vencedor encontrado.</p>';
      }
  } catch (error) {
      console.error('Erro ao obter vencedores:', error);
  }
}

// Carregar os resultados ao iniciar a página
obterVencedores();

