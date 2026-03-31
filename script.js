const URL_API = "https://script.google.com/macros/s/AKfycbxSIGTUR6koKvMBNGWf6EEcvR-Phbjn5CUsM4usXRbObg3deK3r01q-dFkT1OTCaG7r/exec";

document.addEventListener("DOMContentLoaded", function() {
    const campoData = document.getElementById('data');
    const hoje = new Date();
    const diaDaSemana = hoje.getDay(); // 0 (Dom) a 6 (Sab)
    
    let dataMinima = new Date(hoje);

    // Se hoje for de Domingo (0) até Quinta (4)
    if (diaDaSemana <= 4) {
        // A data mínima permitida é a SEGUNDA-FEIRA da PRÓXIMA semana
        // Se hoje é domingo(0), soma 1. Se é segunda(1), soma 7...
        let diasParaProximaSegunda = (diaDaSemana === 0) ? 1 : (8 - diaDaSemana);
        dataMinima.setDate(hoje.getDate() + diasParaProximaSegunda);
    } 
    // Se hoje for Sexta (5) ou Sábado (6)
    else {
        // O prazo para a próxima semana acabou. 
        // A data mínima permitida é a SEGUNDA-FEIRA da OUTRA semana (subsequente)
        let diasParaSegundaSubsequente = (15 - diaDaSemana);
        dataMinima.setDate(hoje.getDate() + diasParaSegundaSubsequente);
    }

    const dataFormatada = dataMinima.toISOString().split('T')[0];
    campoData.setAttribute('min', dataFormatada);
});

function validarDataAgendamento(dataPretendidaString) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const partesData = dataPretendidaString.split('-');
    const dataPretendida = new Date(partesData[0], partesData[1] - 1, partesData[2]);
    dataPretendida.setHours(0, 0, 0, 0);

    // 1. Impedir datas passadas
    if (dataPretendida < hoje) {
        return { valida: false, msg: "Não é possível agendar para uma data que já passou." };
    }

    // 2. Encontrar a SEGUNDA-FEIRA da próxima semana
    const proximaSegunda = new Date(hoje);
    const diasAteSegunda = (hoje.getDay() === 0) ? 1 : (8 - hoje.getDay());
    proximaSegunda.setDate(hoje.getDate() + diasAteSegunda);
    proximaSegunda.setHours(0, 0, 0, 0);

    // 3. Verificar se a data pretendida é antes da próxima segunda permitida
    if (dataPretendida < proximaSegunda) {
        return { 
            valida: false, 
            msg: "Agendamentos só são permitidos a partir da segunda-feira da próxima semana." 
        };
    }

    // 4. Validação de prazo: Se hoje já passou de Quinta, não pode agendar para a semana que vem
    const limiteQuinta = new Date(proximaSegunda);
    limiteQuinta.setDate(proximaSegunda.getDate() - 4); // Volta para a quinta-feira da semana de solicitação
    
    const domingoDaProximaSemana = new Date(proximaSegunda);
    domingoDaProximaSemana.setDate(proximaSegunda.getDate() + 6);

    if (hoje > limiteQuinta && dataPretendida <= domingoDaProximaSemana) {
        return { 
            valida: false, 
            msg: "O prazo para agendar para a próxima semana encerrou na quinta-feira. Por favor, selecione uma data a partir da segunda-feira subsequente." 
        };
    }

    return { valida: true };
}

async function enviarSolicitacao() {
    const btn = document.getElementById('btn-confirmar');
    
    const campos = [
        'data', 'horarios', 'nome', 'email', 'orientador', 
        'ensaio', 'ajudante', 'acessorios', 'motivo', 'senha-lab'
    ];

    const dados = {};
    let campoFaltando = false;

    campos.forEach(id => {
        const elemento = document.getElementById(id);
        const valor = elemento ? elemento.value.trim() : "";
        if (!valor) campoFaltando = true;
        dados[id] = valor;
    });

    if (campoFaltando) {
        alert("Por favor, preencha todos os campos do formulário antes de enviar.");
        return;
    }

    // Validação da Regra de Negócio (Data e Prazo)
    const validacao = validarDataAgendamento(dados.data);
    if (!validacao.valida) {
        alert(validacao.msg);
        return;
    }

    btn.disabled = true;
    btn.innerText = "Enviando solicitação...";

    try {
        const response = await fetch(URL_API, {
            method: 'POST',
            body: JSON.stringify({
                action: "enviar_formulario",
                ...dados
            })
        });

        const resultado = await response.text();

        if (resultado.includes("Erro: Senha Incorreta")) {
            alert("Senha incorreta! A solicitação não foi enviada.");
        } else if (resultado.includes("Sucesso")) {
            alert("Solicitação enviada com sucesso! Aguarde o contato do técnico por e-mail.");
            campos.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = "";
            });
        } else {
            alert("Ocorreu um erro inesperado: " + resultado);
        }
    } catch (e) {
        alert("Erro de conexão. Verifique se a URL da API está correta.");
        console.error(e);
    } finally {
        btn.disabled = false;
        btn.innerText = "Enviar Solicitação";
    }
}