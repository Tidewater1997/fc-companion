let url = 'http://127.0.0.1:58889/status';

window.onload = getStatus;

function getStatus() {
    fetch(url)
        .then(res => res.json())
        .then(updatePage)
        .catch(err => { throw err });

}

function updatePage(json) {
    if (json.status == "alive") {
        document.querySelector(".indicator").className = "indicator good";
        document.querySelector(".status").innerText = json.status + " - Ready to open game";
    } else if (json.status == "error") {
        document.querySelector(".indicator").className = "indicator warn";
        document.querySelector(".status").innerText = json.status + " - Please check my logs";
    } else if (json.status == "fatal") {
        document.querySelector(".indicator").className = "indicator bad";
        document.querySelector(".status").innerText = json.status + " - Cannot locate FC .exe, unable to proceed. Is the game installed and ran at least one time?";
    }

    document.querySelector(".exe").innerText = json["FC-path"];
    document.querySelector(".port").innerText = json.port;
}

