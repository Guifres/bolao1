import supabase from './supabase';

// Função para registrar o palpite com pagamento
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Impede o comportamento padrão do formulário

  // Pegando os valores de nome e telefone
  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;

  // Obtendo os valores dos inputs de gols para os palpites
  const palpites = [
    { Juventude: document.getElementById("time1-gols").value, ECVitoria: document.getElementById("time2-gols").value },
    { Gremio: document.getElementById("time3-gols").value, AtleticoMG: document.getElementById("time4-gols").value },
    { Cruzeiro: document.getElementById("time5-gols").value, Mirasol: document.getElementById("time6-gols").value },
    { Palmeiras: document.getElementById("time7-gols").value, Botafogo: document.getElementById("time8-gols").value },
    { Bahia: document.getElementById("time9-gols").value, Corinthians: document.getElementById("time10-gols").value },
    { Fortaleza: document.getElementById("time11-gols").value, Fluminense: document.getElementById("time12-gols").value },
    { SaoPaulo: document.getElementById("time13-gols").value, SportRecife: document.getElementById("time14-gols").value },
    { Flamengo: document.getElementById("time15-gols").value, Internacional: document.getElementById("time16-gols").value },
    { VascodaGama: document.getElementById("time17-gols").value, Santos: document.getElementById("time18-gols").value },
    { Bragantino: document.getElementById("time19-gols").value, CearaSC: document.getElementById("time20-gols").value },
  ];

  // Dados a serem enviados ao backend
  const dados = {
    nome,
    telefone,
    palpites: JSON.stringify(palpites)
  };


  // Função para realizar o pagamento antes de registrar o palpite
  async function realizarPagamento() {
    const valor = 10.00; // Defina o valor do bolão

    // Fazendo o pagamento via API Mercado Pago
    const response = await fetch("http://localhost:5000/pagamento", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, telefone, valor }),
    });

    const data = await response.json();
    if (data.status === "approved") {
      alert("Pagamento aprovado! Agora seu palpite será registrado.");
      registrarPalpite(); // Chama a função para salvar o palpite no banco de dados
    } else {
      alert("Erro no pagamento. Tente novamente.");
    }
  }

  // Função para registrar o palpite
  async function registrarPalpite() {
    try {

      const {data, error} = await supabase
        .from('palpites')
        .insert([dados]);
      
      if (error) {
        throw error;
      }

      alert("Palpite registrado com sucesso")
      form.reset();
      getResultados();

    } catch (error) {
      console.error("Erro ao registrar palpite", error);
      alert("Erro ao registrar palpite.Tente novamente")
    }
  // Chama a função de pagamento antes de registrar o palpite
  realizarPagamento();
  };

// Função para buscar os vencedores
let vencedoresOrdenados = []; // Armazena os vencedores para pesquisa

// Função para buscar os vencedores do servidor
async function obterVencedores() {
  try {
    const response = await fetch('http://localhost:5000/palpites/vencedores');
    const data = await response.json();

    const vencedoresLista = document.getElementById('vencedores-lista');
    const erroDiv = document.getElementById('erro');
    vencedoresLista.innerHTML = '';  // Limpar a lista anterior
    erroDiv.innerHTML = ''; // Limpar erro anterior

    if (data && Array.isArray(data.vencedores) && data.vencedores.length > 0) {
      // Ordenar vencedores por pontos de forma decrescente
      vencedoresOrdenados = data.vencedores.sort((a, b) => b.pontos - a.pontos);
      exibirVencedores(vencedoresOrdenados);
    } else {
      erroDiv.innerHTML = 'Nenhum vencedor encontrado.';
    }
  } catch (error) {
    console.error('Erro ao obter vencedores:', error);
    document.getElementById('erro').innerHTML = 'Erro ao obter os vencedores. Tente novamente mais tarde.';
  }
}

// Função para exibir os vencedores na tela
function exibirVencedores(lista) {
  const vencedoresLista = document.getElementById('vencedores-lista');
  vencedoresLista.innerHTML = ''; // Limpa a lista antes de atualizar

  lista.forEach((vencedor, index) => {
    const vencedorItem = document.createElement('li');
    vencedorItem.classList.add('vencedor');
    vencedorItem.innerHTML = `
      <strong>Posição ${index + 1}:</strong> ${vencedor.nome} - ${vencedor.pontos} pontos
    `;
    vencedoresLista.appendChild(vencedorItem);
  });
}

// Função para filtrar os vencedores pelo nome digitado
function filtrarVencedores() {
  const termoPesquisa = document.getElementById('pesquisa-nome').value.toLowerCase();
  
  // Filtra a lista com base no nome digitado
  const listaFiltrada = vencedoresOrdenados.filter(vencedor => 
    vencedor.nome.toLowerCase().includes(termoPesquisa)
  );

  // Exibe a lista filtrada
  exibirVencedores(listaFiltrada);
}

// Chama a função quando o conteúdo da página for carregado
document.addEventListener('DOMContentLoaded', obterVencedores);
})

