// Elementos do DOM
const sessionForm = document.getElementById("session-form");
const sessionTableBody = document.getElementById("session-table-body");
const emptyMessage = document.getElementById("empty-message");
const totalProfitEl = document.getElementById("total-profit");
const totalSessionsEl = document.getElementById("total-sessions");
const totalRoiEl = document.getElementById("total-roi");

// Carregar sessões salvas no LocalStorage ou iniciar array vazio
let sessions = JSON.parse(localStorage.getItem("grind_sessions")) || [];

// Inicializar a aplicação ao carregar a página
function init() {
  // Definir a data de hoje por padrão no campo de data
  document.getElementById("date").valueAsDate = new Date();
  renderSessions();
  updateDashboard();
}

// Evento de envio do formulário
sessionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const date = document.getElementById("date").value;
  const platform = document.getElementById("platform").value;
  const buyin = parseFloat(document.getElementById("buyin").value);
  const payout = parseFloat(document.getElementById("payout").value);
  const hours = parseFloat(document.getElementById("hours").value);

  // Cálculo do lucro líquido da sessão
  const profit = payout - buyin;

  const newSession = {
    id: Date.now(), // ID único baseado no timestamp atual
    date,
    platform,
    buyin,
    payout,
    profit,
    hours,
  };

  sessions.push(newSession);
  saveAndRefresh();

  // Resetar campos de valores, mantendo a data e plataforma atuais
  document.getElementById("buyin").value = "";
  document.getElementById("payout").value = "";
  document.getElementById("hours").value = "";
});

// Salvar no LocalStorage e atualizar interface
function saveAndRefresh() {
  localStorage.setItem("grind_sessions", JSON.stringify(sessions));
  renderSessions();
  updateDashboard();
}

// Renderizar tabela de histórico
function renderSessions() {
  sessionTableBody.innerHTML = "";

  if (sessions.length === 0) {
    emptyMessage.style.display = "block";
    return;
  } else {
    emptyMessage.style.display = "none";
  }

  // Ordenar da data mais recente para a mais antiga
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  sortedSessions.forEach((session) => {
    const tr = document.createElement("tr");
    const profitClass = session.profit >= 0 ? "text-green" : "text-red";
    const formattedProfit =
      session.profit >= 0
        ? `+$${session.profit.toFixed(2)}`
        : `-$${Math.abs(session.profit).toFixed(2)}`;

    // Formatar data YYYY-MM-DD para DD/MM/YYYY
    const [year, month, day] = session.date.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    tr.innerHTML = `
            <td>${formattedDate}</td>
            <td>${session.platform}</td>
            <td>$${session.buyin.toFixed(2)}</td>
            <td>$${session.payout.toFixed(2)}</td>
            <td class="${profitClass}">${formattedProfit}</td>
            <td>${session.hours}h</td>
            <td><button class="btn-delete" onclick="deleteSession(${session.id})">Excluir</button></td>
        `;
    sessionTableBody.appendChild(tr);
  });
}

// Atualizar os cards do topo (Lucro Total, Sessões, ROI)
function updateDashboard() {
  let totalProfit = 0;
  let totalBuyin = 0;

  sessions.forEach((session) => {
    totalProfit += session.profit;
    totalBuyin += session.buyin;
  });

  // Lucro Total
  totalProfitEl.textContent =
    totalProfit >= 0
      ? `+$${totalProfit.toFixed(2)}`
      : `-$${Math.abs(totalProfit).toFixed(2)}`;
  totalProfitEl.className = totalProfit >= 0 ? "text-green" : "text-red";

  // Total de Sessões
  totalSessionsEl.textContent = sessions.length;

  // ROI Médio Global (Lucro Total / Buy-in Total * 100)
  let roi = totalBuyin > 0 ? (totalProfit / totalBuyin) * 100 : 0;
  totalRoiEl.textContent = `${roi.toFixed(1)}%`;
  totalRoiEl.className = roi >= 0 ? "text-green" : "text-red";
}

// Excluir uma sessão específica
function deleteSession(id) {
  sessions = sessions.filter((session) => session.id !== id);
  saveAndRefresh();
}

// Executar script inicial
init();
