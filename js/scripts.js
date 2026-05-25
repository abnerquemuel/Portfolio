function openNav() {

    var nav = document.getElementById("navigation");
    var icon = document.getElementById("icon-menu");

    nav.classList.toggle("menujs");

    if (nav.classList.contains("menujs")) {

        icon.innerText = "X";

    } else {

        icon.innerText = "☰";

    }

}
function setupAiAssistant() {
    var chat = document.getElementById("aiChat");
    var buttons = document.querySelectorAll("[data-ai-question]");

    if (!chat || buttons.length === 0) {
        return;
    }

    var answers = {
        projetos: "Os projetos principais mostram logica, interface e produto: calculadora, chat em tempo real, Snake e e-commerce com carrinho. Eles ajudam a provar que o Abner pratica tanto JavaScript quanto experiencia visual.",
        curriculo: "Abner Quemuel e um desenvolvedor em formacao, focado em construir projetos praticos, evoluir em front-end e transformar ideias em paginas e ferramentas funcionais.",
        vaga: "Para uma vaga junior, o ponto forte e ter portfolio vivo: projetos publicados, codigo evoluindo e vontade de aprender rapido. Isso mostra iniciativa alem do curriculo.",
        tecnologias: "O portfolio usa HTML, CSS e JavaScript. Os projetos tambem reforcam manipulacao de DOM, responsividade, organizacao visual e interacao com o usuario."
    };

    var labels = {
        projetos: "Quais sao os projetos principais?",
        curriculo: "Resuma meu curriculo",
        vaga: "Sirvo para vaga junior?",
        tecnologias: "Quais tecnologias eu uso?"
    };

    function addMessage(text, type) {
        var message = document.createElement("p");
        message.className = "ai-message " + type;
        message.innerText = text;
        chat.appendChild(message);
        chat.scrollTop = chat.scrollHeight;
    }

    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            var key = button.getAttribute("data-ai-question");
            addMessage(labels[key], "user");
            window.setTimeout(function() {
                addMessage(answers[key], "bot");
            }, 350);
        });
    });
}

document.addEventListener("DOMContentLoaded", setupAiAssistant);
