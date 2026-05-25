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
function setupAiProfileScan() {
    var section = document.querySelector(".ai-lab");
    var button = document.getElementById("runAiScan");
    var status = document.getElementById("aiScanStatus");
    var score = document.getElementById("aiScore");
    var items = document.querySelectorAll("[data-scan-item]");

    if (!section || !button || !status || !score) {
        return;
    }

    function setStatus(text, delay) {
        window.setTimeout(function() {
            status.innerText = text;
        }, delay);
    }

    function animateScore(target) {
        var current = 0;
        var timer = window.setInterval(function() {
            current += 4;
            if (current >= target) {
                current = target;
                window.clearInterval(timer);
            }
            score.innerText = current.toString().padStart(2, "0") + "%";
        }, 38);
    }

    function runScan() {
        section.classList.remove("is-scanned");
        button.disabled = true;
        button.innerText = "Analisando...";
        score.innerText = "00%";

        items.forEach(function(item) {
            item.classList.remove("is-visible");
        });

        setStatus("Lendo projetos publicados...", 0);
        setStatus("Cruzando habilidades com perfil junior...", 650);
        setStatus("Gerando resumo de potencial profissional...", 1300);

        window.setTimeout(function() {
            section.classList.add("is-scanned");
            animateScore(88);
        }, 900);

        items.forEach(function(item, index) {
            window.setTimeout(function() {
                item.classList.add("is-visible");
            }, 1350 + index * 420);
        });

        window.setTimeout(function() {
            status.innerText = "Analise pronta: portfolio com boa iniciativa, projetos praticos e evolucao visivel.";
            button.disabled = false;
            button.innerText = "Gerar novamente";
        }, 2800);
    }

    button.addEventListener("click", runScan);
    window.setTimeout(runScan, 700);
}

document.addEventListener("DOMContentLoaded", setupAiProfileScan);
