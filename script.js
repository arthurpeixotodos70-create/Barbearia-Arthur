// ==========================
// SERVIÇOS
// ==========================

const servicos = document.querySelectorAll(".servico");
let servicoSelecionado = "";

servicos.forEach(function (servico) {

    servico.addEventListener("click", function () {

        servicos.forEach(function (item) {
            item.classList.remove("selecionado");
        });

        servico.classList.add("selecionado");
        servicoSelecionado = servico.dataset.servico;

    });

});


// ==========================
// HORÁRIOS
// ==========================

const horarios = document.querySelectorAll(".horario");
let horarioSelecionado = "";

horarios.forEach(function (horario) {

    horario.addEventListener("click", function () {

        // Não deixa selecionar horário bloqueado
        if (horario.disabled) {
            return;
        }

        horarios.forEach(function (item) {
            item.classList.remove("selecionado");
        });

        horario.classList.add("selecionado");
        horarioSelecionado = horario.dataset.horario;

    });

});


// ==========================
// ELEMENTOS
// ==========================

const whatsapp = document.getElementById("whatsapp");
const nome = document.getElementById("nome");
const data = document.getElementById("data");


// ==========================
// DATA MÍNIMA
// ==========================

const hoje = new Date();

const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");

const dataHoje = `${ano}-${mes}-${dia}`;

data.min = dataHoje;


// ==========================
// VERIFICAR HORÁRIOS PASSADOS
// ==========================

function atualizarHorarios() {

    const agora = new Date();

    horarios.forEach(function (horario) {

        const horaBotao = horario.dataset.horario;

        const partes = horaBotao.split(":");

        const hora = Number(partes[0]);
        const minuto = Number(partes[1]);

        // Primeiro libera todos
        horario.disabled = false;
        horario.style.opacity = "1";
        horario.style.cursor = "pointer";


        // Se a data escolhida for hoje
        if (data.value === dataHoje) {

            const horarioJaPassou =
                hora < agora.getHours() ||
                (
                    hora === agora.getHours() &&
                    minuto <= agora.getMinutes()
                );

            if (horarioJaPassou) {

                horario.disabled = true;
                horario.style.opacity = "0.3";
                horario.style.cursor = "not-allowed";

                // Se estava selecionado, remove
                if (horario.classList.contains("selecionado")) {

                    horario.classList.remove("selecionado");
                    horarioSelecionado = "";

                }

            }

        }

    });

}


// Quando escolher uma data
data.addEventListener("change", atualizarHorarios);


// ==========================
// AGENDAMENTO
// ==========================

whatsapp.addEventListener("click", function (event) {

    event.preventDefault();


    if (nome.value.trim() === "") {
        alert("Digite seu nome.");
        return;
    }


    if (servicoSelecionado === "") {
        alert("Escolha um serviço.");
        return;
    }


    if (data.value === "") {
        alert("Escolha uma data.");
        return;
    }


    if (horarioSelecionado === "") {
        alert("Escolha um horário.");
        return;
    }


    // ==========================
    // FORMATAR DATA
    // ==========================

    const partesData = data.value.split("-");

    const dataFormatada =
        partesData[2] + "/" +
        partesData[1] + "/" +
        partesData[0];


    // ==========================
    // WHATSAPP
    // ==========================

    const numero = "5561986350940";

    const mensagem =
        "Olá! Gostaria de agendar:" +
        "\n\nNome: " + nome.value.trim() +
        "\nServiço: " + servicoSelecionado +
        "\nData: " + dataFormatada +
        "\nHorário: " + horarioSelecionado;


    const link =
        "https://wa.me/" +
        numero +
        "?text=" +
        encodeURIComponent(mensagem);


    window.open(link, "_blank");

});