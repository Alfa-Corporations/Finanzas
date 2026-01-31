// ================================
// Estado principal
// ================================

let data = JSON.parse(localStorage.getItem("finanzas")) || {};
let mesActual = new Date().toISOString().slice(0, 7);

// ================================
// Referencias DOM
// ================================

const lista = document.getElementById("lista");
const mesFiltro = document.getElementById("mesFiltro");
const canvasGrafico = document.getElementById("grafico");

// Inputs
const desc = document.getElementById("desc");
const monto = document.getElementById("monto");
const categoria = document.getElementById("categoria");
const tipo = document.getElementById("tipo");

// Totales
const ingresosTxt = document.getElementById("ingresos");
const gastosTxt = document.getElementById("gastos");
const balanceTxt = document.getElementById("balance");

if (!data[mesActual]) data[mesActual] = { mov: [], saldo: 0 };

// ================================
// Persistencia
// ================================

function guardar() {
  localStorage.setItem("finanzas", JSON.stringify(data));
}

// ================================
// Agregar movimiento
// ================================

function agregar() {
  
  const d = desc.value.trim();
  const m = Number(monto.value);
  const c = categoria.value;
  const t = tipo.value;
  
  if (!d || !m) return alert("Completa los campos");
  
  data[mesActual].mov.push({
    id: Date.now(),
    d,
    m,
    c,
    t
  });
  
  desc.value = "";
  monto.value = "";
  
  guardar();
  render();
}

// ================================
// Eliminar
// ================================

function del(id) {
  data[mesActual].mov = data[mesActual].mov.filter(x => x.id !== id);
  guardar();
  render();
}

// ================================
// Render UI
// ================================

let chart;

function render() {
  
  mesActual = mesFiltro.value || mesActual;
  
  lista.innerHTML = "";
  
  let ingresos = 0;
  let gastos = 0;
  
  data[mesActual].mov.forEach(x => {
    
    if (x.t === "ingreso") ingresos += x.m;
    else gastos += x.m;
    
    lista.innerHTML += `
      <div class="item">
        <b>${x.d}</b><br>
        $${x.m} · ${x.c}<br>
        ${x.t}
        <div style="float:right" onclick="del(${x.id})">❌</div>
      </div>
    `;
  });
  
  const balance = ingresos - gastos + data[mesActual].saldo;
  
  ingresosTxt.innerText = `Ingresos $${ingresos}`;
  gastosTxt.innerText = `Gastos $${gastos}`;
  balanceTxt.innerText = `$${balance}`;
  
  cargarMeses();
  pintarGrafico(ingresos, gastos);
}

// ================================
// Gráfico
// ================================

function pintarGrafico(i, g) {
  
  if (chart) chart.destroy();
  
  chart = new Chart(canvasGrafico, {
    type: "doughnut",
    data: {
      labels: ["Ingresos", "Gastos"],
      datasets: [{
        data: [i, g]
      }]
    }
  });
}

// ================================
// Meses
// ================================

function cargarMeses() {
  
  mesFiltro.innerHTML = "";
  
  Object.keys(data).sort().reverse().forEach(m => {
    mesFiltro.innerHTML += `<option value="${m}">${m}</option>`;
  });
  
  mesFiltro.value = mesActual;
}

// ================================
// Cierre mensual
// ================================

function cerrarMes() {
  
  let ingresos = 0;
  let gastos = 0;
  
  data[mesActual].mov.forEach(x => {
    if (x.t === "ingreso") ingresos += x.m;
    else gastos += x.m;
  });
  
  const saldoFinal = ingresos - gastos + data[mesActual].saldo;
  
  const fecha = new Date(mesActual + "-01");
  fecha.setMonth(fecha.getMonth() + 1);
  const nuevoMes = fecha.toISOString().slice(0, 7);
  
  data[nuevoMes] = {
    mov: [],
    saldo: saldoFinal
  };
  
  guardar();
  
  alert(`Mes cerrado. Nuevo mes iniciado con saldo $${saldoFinal}`);
  location.reload();
}

// ================================
// Exportar Excel
// ================================

function exportar() {
  const ws = XLSX.utils.json_to_sheet(data[mesActual].mov);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, mesActual);
  XLSX.writeFile(wb, `finanzas-${mesActual}.xlsx`);
}

// ================================
// Init
// ================================

cargarMeses();
render();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}