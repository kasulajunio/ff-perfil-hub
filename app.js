(function () {
  var form = document.getElementById("lookup-form");
  var uid = document.getElementById("uid");
  var message = document.getElementById("message");
  var button = form.querySelector("button[type=submit]");
  var region = form.querySelector("select");
  var result = document.createElement("section");
  result.id = "profile-result";
  result.setAttribute("aria-live", "polite");
  result.style.cssText = "display:none;margin-top:16px;padding:14px;border:1px solid #31525c;border-radius:12px;background:#10232b;color:#eef8fa";
  message.insertAdjacentElement("afterend", result);

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char];
    });
  }

  function item(label, value) {
    return value === undefined || value === null || value === "" ? "" : "<p style=\"margin:6px 0\"><strong>" + label + ":</strong> " + escapeHtml(value) + "</p>";
  }

  function render(data) {
    var info = data.basicInfo || data.basicinfo || data.AccountInfo || data;
    var profile = data.profileInfo || data.profileinfo || data.AccountProfileInfo || {};
    var name = info.nickname || info.AccountName || info.name || "Jogador encontrado";
    result.innerHTML = "<h3 style=\"margin:0 0 10px\">" + escapeHtml(name) + "</h3>" +
      item("UID", info.accountId || info.accountid || info.AccountId) +
      item("Região", info.region || info.AccountRegion) +
      item("Nível", info.level || info.AccountLevel) +
      item("Likes", info.liked || info.AccountLikes) +
      item("Rank BR", info.rank || info.BrRankPoint || profile.BrRankPoint) +
      item("Rank CS", info.csRank || info.csrank || info.CsRankPoint || profile.CsRankPoint);
    result.style.display = "block";
  }

  async function getJson(url) {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 8000);
    try {
      var response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("Serviço indisponível");
      var data = await response.json();
      if (data.error || data.success === false) throw new Error(data.error || "Perfil não encontrado");
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    var value = uid.value.trim();
    if (!/^[0-9]{5,15}$/.test(value)) {
      message.textContent = "Digite um UID válido, com 5 a 15 números.";
      message.className = "message error";
      uid.focus();
      return;
    }
    result.style.display = "none";
    button.disabled = true;
    button.textContent = "Consultando…";
    message.textContent = "Buscando dados públicos do perfil…";
    message.className = "message";
    var selectedRegion = region ? region.value : "BR";
    var services = [
      "https://wzapiinfo.vercel.app/get?uid=" + encodeURIComponent(value),
      "https://ff-uid-to-info-api-blush.vercel.app/player-info?uid=" + encodeURIComponent(value),
      "https://ffdvinh09-info.vercel.app/player-info?region=" + encodeURIComponent(selectedRegion) + "&uid=" + encodeURIComponent(value)
    ];
    try {
      var lastError;
      for (var i = 0; i < services.length; i += 1) {
        try {
          render(await getJson(services[i]));
          message.textContent = "Dados públicos encontrados.";
          return;
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError || new Error("Consulta indisponível");
    } catch (error) {
      message.textContent = "Não foi possível encontrar dados públicos deste UID agora. Confira o UID e a região e tente de novo mais tarde.";
      message.className = "message error";
    } finally {
      button.disabled = false;
      button.textContent = "Consultar perfil";
    }
  });
}());