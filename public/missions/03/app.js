// Ett klick ska byta spelarens status. / A click should change the player status.
const button = document.querySelector("#play");
function playCurrent() {
  document.querySelector("#status").textContent = "PLAYING";
  document.querySelector("#status").dataset.playing = "true";
}
button.addEventListener("hover", playCurrent);
