const URL_API = "https://script.google.com/macros/s/AKfycbwrpGF-2n8Ou_6i02g6pB1sLWN205rCTQB81ZSBc2dSx7nvffBiNdYf1ve1MkihbEMiYw/exec";

const corpoAgenda = document.getElementById('corpo-agenda');
const seletorData = document.getElementById('data');
const seletorMaquina = document.getElementById('maquina');
let reservasGlobais = {};
// Esta "sacola" guarda as chaves selecionadas de vários dias/máquinas
let selecoesTemporarias = new Set();

function formatarInstrucao(texto) {
  return texto.replace(
    "Equipamentos:",
    "<strong>Equipamentos:</strong>"
  ).replace(/\n/g, "<br>");
}

const instrucoesMaquinas = {
    "1": "- Não levar bebidas ou comida à mesa do computador;"
        + "\n- Não desconectar os cabos do computador, exceto com autorização do responsável pelo GrID;"
        + "\n- Desligar o computador ao final do uso (seja presencial ou remoto);"
        + "\n- Solicitações de uso remoto durante o final de semana será passivel de rejeição, tendo em vista oscilações na rede elétrica observadas na sexta-feira;"
        + "\n- Criação ou excluisão de usuários será feito unicamente pelo responsável do GrID ou pela administração do INCT-Infra.",
    "2": "- Não levar bebidas ou comida à mesa do computador;"
        + "\n- Não desconectar os cabos do computador, exceto com autorização do responsável pelo GrID;"
        + "\n- Desligar o computador ao final do uso (seja presencial ou remoto);"
        + "\n- Solicitações de uso remoto durante o final de semana será passivel de rejeição, tendo em vista oscilações na rede elétrica observadas na sexta-feira;"
        + "\n- Criação ou excluisão de usuários será feito unicamente pelo responsável do GrID ou pela administração do INCT-Infra.",
    "3": "- Não levar bebidas ou comida à mesa do computador;"
        + "\n- Não desconectar os cabos do computador, exceto com autorização do responsável pelo GrID;"
        + "\n- Desligar o computador ao final do uso (seja presencial ou remoto);"
        + "\n- Solicitações de uso remoto durante o final de semana será passivel de rejeição, tendo em vista oscilações na rede elétrica observadas na sexta-feira;"
        + "\n- Criação ou excluisão de usuários será feito unicamente pelo responsável do GrID ou pela administração do INCT-Infra.",
    "4": "- Não levar bebidas ou comida à mesa do computador;"
        + "\n- Não desconectar os cabos do computador, exceto com autorização do responsável pelo GrID;"
        + "\n- Desligar o computador ao final do uso (seja presencial ou remoto);"
        + "\n- Solicitações de uso remoto durante o final de semana será passivel de rejeição, tendo em vista oscilações na rede elétrica observadas na sexta-feira;"
        + "\n- Criação ou excluisão de usuários será feito unicamente pelo responsável do GrID ou pela administração do INCT-Infra.",
    "5": "- Não levar bebidas ou comida à mesa do computador;"
        + "\n- Não desconectar os cabos do computador, exceto com autorização do responsável pelo GrID;"
        + "\n- Desligar o computador ao final do uso (seja presencial ou remoto);"
        + "\n- Solicitações de uso remoto durante o final de semana será passivel de rejeição, tendo em vista oscilações na rede elétrica observadas na sexta-feira;"
        + "\n- Criação ou excluisão de usuários será feito unicamente pelo responsável do GrID ou pela administração do INCT-Infra.",
    "6": "- Não levar bebidas ou comida à mesa do computador;"
        + "\n- Não desconectar os cabos do computador, exceto com autorização do responsável pelo GrID;"
        + "\n- Desligar o computador ao final do uso (seja presencial ou remoto);"
        + "\n- Solicitações de uso remoto durante o final de semana será passivel de rejeição, tendo em vista oscilações na rede elétrica observadas na sexta-feira;"
        + "\n- Criação ou excluisão de usuários será feito unicamente pelo responsável do GrID ou pela administração do INCT-Infra.",
    "7": "- Toda e qualquer impressão deverá ser comunicada ao responsável pelo GrID, informando a aplicação da peça impressa e quanto material será gasto;"
        + "\n- Em caso de comportamento inesperado, falhas ou mal funcionamento, o usuário deverá relatar imediatamente o responsável pelo GrID;"    
        + "\n- É prioritário o uso de filamentos já abertos;"
        + "\n- Caso algum rolo de filamento se esgote, o usuário deverá relatar ao resposável pelo GrID para que seja dado baixa no quantitativo;"
        + "\n- Manter a impressora limpa de resíduos de filamento e limpar a bandeja antes e após o uso;"
        + "\n- Não usar as ferramentas da impressora para outros fins (Ex: alicate, espátula, etc.).",
    "8": "- Toda e qualquer impressão deverá ser comunicada ao responsável pelo GrID, informando a aplicação da peça impressa e quanto material será gasto;"
        + "\n- Em caso de comportamento inesperado, falhas ou mal funcionamento, o usuário deverá relatar imediatamente o responsável pelo GrID;"    
        + "\n- É prioritário o uso de filamentos já abertos;"
        + "\n- Caso algum rolo de filamento se esgote, o usuário deverá relatar ao resposável pelo GrID para que seja dado baixa no quantitativo;"
        + "\n- Manter a impressora limpa de resíduos de filamento e limpar a bandeja antes e após o uso;"
        + "\n- Não usar as ferramentas da impressora para outros fins (Ex: alicate, espátula, etc.).",
    "9": "- Manter a sala limpa e organizada após o uso;"
        + "\n- O uso de qualquer máquina durante a utilização da sala ocorrerá apenas se não ouver conflito de reservas."
};

function configurarDataAtual() {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    document.getElementById('data').value = dataFormatada;
}

function mostrarInstrucoes() {
    const maquinaId = document.getElementById('maquina').value;
    const containerInstrucoes = document.getElementById('texto-instrucoes');
    const containerImpressora = document.getElementById('campos-impressora');

    // 1. Atualiza o texto de instruções (usando a lógica de formatação que você já tem)
    if (instrucoesMaquinas[maquinaId]) {
        containerInstrucoes.innerHTML = formatarInstrucao(instrucoesMaquinas[maquinaId]);
    } else {
        containerInstrucoes.innerHTML = "Selecione uma opção para ver as instruções.";
    }

    // 2. Lógica de visibilidade dos campos extras
    // Assumindo que 7 e 8 são as suas impressoras no HTML
    if (maquinaId === "7" || maquinaId === "8") {
        containerImpressora.style.display = "block";
    } else {
        containerImpressora.style.display = "none";
        // Limpa os campos quando esconde para não enviar lixo de uma reserva anterior
        document.getElementById('material').value = "";
        document.getElementById('destino').value = "";
    }
}

configurarDataAtual();

async function carregarReservas() {
    corpoAgenda.innerHTML = '<tr><td colspan="3">Carregando horários...</td></tr>';
    try {
        const response = await fetch(URL_API);
        reservasGlobais = await response.json();
        atualizarAgenda();
    } catch (e) {
        corpoAgenda.innerHTML = '<tr><td colspan="3">Erro ao carregar dados.</td></tr>';
    }
}

function atualizarAgenda() {
    corpoAgenda.innerHTML = '';
    const dataSelecionada = seletorData.value;
    const maquinaSelecionada = seletorMaquina.value;

    mostrarInstrucoes();

    for (let hora = 0; hora < 24; hora++) {
        const horarioFormatado = `${hora}:00 - ${hora + 1}:00`;
        const chaveReserva = `${dataSelecionada}-M${maquinaSelecionada}-${hora}`;
        const nomeReserva = reservasGlobais[chaveReserva];

        // Verifica se esta chave já está na nossa "sacola" de seleções
        const estaMarcado = selecoesTemporarias.has(chaveReserva) ? 'checked' : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${horarioFormatado}</td>
            <td class="${nomeReserva ? 'ocupado' : 'disponivel'}">
                ${nomeReserva ? `Reservado por: ${nomeReserva}` : 'Disponível'}
            </td>
            <td>
                ${nomeReserva 
                    ? '---' 
                    : `<input type="checkbox" class="chk-reserva" value="${chaveReserva}" ${estaMarcado} onchange="gerenciarSelecao(this)">`
                }
            </td>
        `;
        corpoAgenda.appendChild(tr);
    }
}

// Função que adiciona ou remove da "sacola" ao clicar no checkbox
function gerenciarSelecao(checkbox) {
    if (checkbox.checked) {
        selecoesTemporarias.add(checkbox.value);
    } else {
        selecoesTemporarias.delete(checkbox.value);
    }
    
    // Opcional: Atualiza o texto do botão com a contagem
    const btn = document.getElementById('btn-confirmar');
    btn.innerText = selecoesTemporarias.size > 0 
        ? `Confirmar ${selecoesTemporarias.size} reserva(s)` 
        : "Confirmar Reservas Selecionadas";
}

async function reservarSelecionados() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const orientador = document.getElementById('orientador').value;
    const senhaInformada = document.getElementById('senha-lab').value;
    const seletor = document.getElementById('maquina'); // Referência ao select
    const maquinaId = seletor.value;

    const materialValor = document.getElementById('material').value;
    const destinoValor = document.getElementById('destino').value;

    if (!senhaInformada) return alert("Digite a senha do laboratório!");
    if (!nome || !email || !orientador) return alert("Preencha todos os dados!");
    if (selecoesTemporarias.size === 0) return alert("Selecione pelo menos um horário!");

    const btn = document.getElementById('btn-confirmar');
    btn.disabled = true;
    btn.innerText = "Processando...";

    // Criamos a lista de reservas capturando o nome exibido no HTML
    const listaReservas = Array.from(selecoesTemporarias).map(chave => {
        const partes = chave.split('-');
        const idMaquina = partes[3].replace('M', '');
        
        // Esta linha busca o texto (ex: "Impressora 3D 02 - Bambu Lab") baseado no value
        const nomeExibido = seletor.querySelector(`option[value="${idMaquina}"]`).text;

        return {
            chave: chave,
            data: `${partes[0]}-${partes[1]}-${partes[2]}`,
            maquina: nomeExibido,
            infoExtra: (maquinaId === "7" || maquinaId === "8") 
                   ? `Material: ${document.getElementById('material').value}g | Destino: ${document.getElementById('destino').value}`
                   : "N/A"
        };
    });

    try {
        const response = await fetch(URL_API, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'reservar_lote', 
                senha: senhaInformada,
                usuario: { nome, email, orientador }, // Isso garante que os dados cheguem ao e-mail
                reservas: listaReservas,
                detalhesImpressao: { 
                    material: materialValor, 
                    destino: destinoValor 
                }
            })
        });

        const resultado = await response.text();
        
        if (resultado.includes("Erro: Senha Incorreta")) {
            alert("Senha incorreta!");
        } else {
            alert("Reservas confirmadas com sucesso!");
            selecoesTemporarias.clear();
            document.getElementById('senha-lab').value = "";
            carregarReservas();
        }
    } catch (e) {
        alert("Erro na conexão.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Confirmar Reservas Selecionadas";
    }
}

seletorData.addEventListener('change', atualizarAgenda);
seletorMaquina.addEventListener('change', atualizarAgenda);
carregarReservas();