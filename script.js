// ==========================
// FIREBASE
// ==========================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDmJdeXlV5xCH5EzMIDdgsSQRhZtzjXdnY",
    authDomain: "barbearia--arthur.firebaseapp.com",
    projectId: "barbearia--arthur",
    storageBucket: "barbearia--arthur.firebasestorage.app",
    messagingSenderId: "404768920939",
    appId: "1:404768920939:web:6105d9879ec44cd478e82e",
    measurementId: "G-KH52M68SNF"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


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
// DATA DE HOJE
// ==========================

function pegarDataHoje() {

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoje.getDate()
    ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


const dataHoje = pegarDataHoje();

data.min = dataHoje;


// ==========================
// LIBERAR HORÁRIOS
// ==========================

function liberarHorarios() {

    horarios.forEach(function (horario) {

        horario.disabled = false;

        horario.style.opacity = "1";

        horario.style.cursor = "pointer";

        horario.title = "";

    });

}


// ==========================
// BLOQUEAR HORÁRIO
// ==========================

function bloquearHorario(horario) {

    horario.disabled = true;

    horario.style.opacity = "0.3";

    horario.style.cursor = "not-allowed";

    horario.classList.remove("selecionado");


    if (
        horarioSelecionado === horario.dataset.horario
    ) {

        horarioSelecionado = "";

    }

}


// ==========================
// HORÁRIOS QUE JÁ PASSARAM
// ==========================

function bloquearHorariosPassados() {

    if (data.value !== dataHoje) {
        return;
    }


    const agora = new Date();


    horarios.forEach(function (horario) {

        const partes =
            horario.dataset.horario.split(":");


        const hora = Number(partes[0]);

        const minuto = Number(partes[1]);


        const passou =
            hora < agora.getHours() ||

            (
                hora === agora.getHours() &&
                minuto <= agora.getMinutes()
            );


        if (passou) {

            bloquearHorario(horario);

            horario.title = "Este horário já passou.";

        }

    });

}


// ==========================
// BUSCAR HORÁRIOS RESERVADOS
// ==========================

async function buscarHorariosReservados() {

    if (data.value === "") {
        return;
    }


    liberarHorarios();

    bloquearHorariosPassados();


    try {

        const consulta = query(

            collection(db, "agendamentos"),

            where("data", "==", data.value)

        );


        const resultado =
            await getDocs(consulta);


        resultado.forEach(function (documento) {

            const agendamento =
                documento.data();


            horarios.forEach(function (horario) {

                if (
                    horario.dataset.horario ===
                    agendamento.horario
                ) {

                    bloquearHorario(horario);

                    horario.title =
                        "Este horário já foi reservado.";

                }

            });

        });


    } catch (erro) {

        console.error(
            "Erro ao buscar horários:",
            erro
        );

    }

}


// ==========================
// TROCOU A DATA
// ==========================

data.addEventListener(
    "change",
    buscarHorariosReservados
);


// ==========================
// VERIFICAR SE O HORÁRIO
// AINDA ESTÁ DISPONÍVEL
// ==========================

async function horarioEstaDisponivel() {

    const consulta = query(

        collection(db, "agendamentos"),

        where("data", "==", data.value),

        where(
            "horario",
            "==",
            horarioSelecionado
        )

    );


    const resultado =
        await getDocs(consulta);


    return resultado.empty;

}


// ==========================
// AGENDAMENTO
// ==========================

whatsapp.addEventListener(
    "click",
    async function (event) {

        event.preventDefault();


        // NOME

        if (nome.value.trim() === "") {

            alert("Digite seu nome.");

            return;

        }


        // SERVIÇO

        if (servicoSelecionado === "") {

            alert("Escolha um serviço.");

            return;

        }


        // DATA

        if (data.value === "") {

            alert("Escolha uma data.");

            return;

        }


        // HORÁRIO

        if (horarioSelecionado === "") {

            alert("Escolha um horário.");

            return;

        }


        // ==========================
        // CONFERE NOVAMENTE
        // ==========================

        try {

            const disponivel =
                await horarioEstaDisponivel();


            if (!disponivel) {

                alert(
                    "Esse horário acabou de ser reservado. Escolha outro."
                );

                await buscarHorariosReservados();

                return;

            }


            // ==========================
            // SALVAR NO FIRESTORE
            // ==========================

            await addDoc(
                collection(db, "agendamentos"),
                {

                    nome:
                        nome.value.trim(),

                    servico:
                        servicoSelecionado,

                    data:
                        data.value,

                    horario:
                        horarioSelecionado,

                    criadoEm:
                        new Date().toISOString()

                }
            );


            // ==========================
            // FORMATAR DATA
            // ==========================

            const partesData =
                data.value.split("-");


            const dataFormatada =

                partesData[2] +
                "/" +

                partesData[1] +
                "/" +

                partesData[0];


            // ==========================
            // WHATSAPP
            // ==========================

            const numero =
                "5561986350940";


            const mensagem =

                "Olá! Gostaria de agendar:" +

                "\n\nNome: " +
                nome.value.trim() +

                "\nServiço: " +
                servicoSelecionado +

                "\nData: " +
                dataFormatada +

                "\nHorário: " +
                horarioSelecionado;


            const link =

                "https://wa.me/" +
                numero +

                "?text=" +

                encodeURIComponent(
                    mensagem
                );


            // Atualiza horários
            await buscarHorariosReservados();


            // Abre WhatsApp
            window.open(
                link,
                "_blank"
            );


        } catch (erro) {

            console.error(
                "Erro ao realizar agendamento:",
                erro
            );


            alert(
                "Não foi possível realizar o agendamento. Tente novamente."
            );

        }

    }
);
