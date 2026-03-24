const URL_API = "https://script.google.com/macros/s/AKfycbxSIGTUR6koKvMBNGWf6EEcvR-Phbjn5CUsM4usXRbObg3deK3r01q-dFkT1OTCaG7r/exec";

async function enviarSolicitacao() {
    const btn = document.getElementById('btn-confirmar');
    
    // Lista de IDs para coleta e validação
    const campos = [
        'data', 'horarios', 'nome', 'email', 'orientador', 
        'ensaio', 'ajudante', 'acessorios', 'motivo', 'senha-lab'
    ];

    const dados = {};
    let campoFaltando = false;

    // Coleta os valores e verifica se estão preenchidos
    campos.forEach(id => {
        const valor = document.getElementById(id).value.trim();
        if (!valor) {
            campoFaltando = true;
        }
        dados[id] = valor;
    });

    if (campoFaltando) {
        alert("Por favor, preencha todos os campos do formulário antes de enviar.");
        return;
    }

    // Alterar estado do botão
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
            // Limpa o formulário após sucesso
            campos.forEach(id => document.getElementById(id).value = "");
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