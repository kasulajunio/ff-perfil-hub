(function () {
  var form = document.getElementById("lookup-form");
  var uid = document.getElementById("uid");
  var message = document.getElementById("message");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = uid.value.trim();
    if (!/^[0-9]{5,15}$/.test(value)) {
      message.textContent = "Digite um UID válido, com 5 a 15 números.";
      message.className = "message error";
      uid.focus();
      return;
    }
    message.textContent = "UID válido. Falta concluir o login no RapidAPI e escolher uma API de perfil antes da consulta real ser ativada.";
    message.className = "message";
  });
}());
