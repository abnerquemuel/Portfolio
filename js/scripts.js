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