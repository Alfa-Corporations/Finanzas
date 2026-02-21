let cuentas = JSON.parse(localStorage.getItem("cuentas")) || [];
let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];

const lista = document.getElementById("listaCuentas");
const totalPendiente = document.getElementById("totalPendiente");
const form = document.getElementById("formCuenta");

const guardar = () => {
  localStorage.setItem("cuentas", JSON.stringify(cuentas));
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
};

const registrarGasto = (nombre, monto) => {
  movimientos.push({
    tipo: "gasto",
    categoria: "Cuenta",
    descripcion: "Abono a " + nombre,
    monto
  });
};

const render = () => {
  
  lista.innerHTML = "";
  let total = 0;
  
  cuentas.forEach((c, i) => {
    
    total += c.saldoPendiente;
    
    const div = document.createElement("div");
    div.className = "card" + (c.saldoPendiente === 0 ? " paid" : "");
    
    let historialHTML = "";
    c.abonos.forEach(a => {
      historialHTML += `<div>• ${a.fecha} - $${a.monto}</div>`;
    });
    
    div.innerHTML = `
      <strong>${c.nombre}</strong><br>
      Total: $${c.montoOriginal}<br>
      Pendiente: <span class="saldo">$${c.saldoPendiente}</span><br>
      <small>${c.fecha}</small>

      <div style="margin-top:10px;">
        <button onclick="abonar(${i})">💵 Abonar</button>
        <button onclick="eliminarCuenta(${i})">❌</button>
      </div>

      <div class="auto">
        <label>
          <input type="checkbox" onchange="toggleAuto(${i}, this.checked)" ${c.autoActivo ? "checked":""}>
          Abono automático
        </label>
        <div>
          <input type="number" placeholder="Monto automático"
          value="${c.autoMonto || ""}"
          onchange="setAutoMonto(${i}, this.value)">
        </div>
      </div>

      <div class="historial">
        <b>Historial:</b>
        ${historialHTML || "<div>Sin abonos</div>"}
      </div>
    `;
    
    lista.appendChild(div);
  });
  
  totalPendiente.textContent = "Total pendiente general: $" + total;
};

const agregarCuenta = (e) => {
  e.preventDefault();
  
  const nombre = document.getElementById("nombre").value;
  const monto = Number(document.getElementById("monto").value);
  const fecha = document.getElementById("fecha").value;
  
  if (!nombre || !monto) return;
  
  cuentas.push({
    nombre,
    montoOriginal: monto,
    saldoPendiente: monto,
    fecha,
    abonos: [],
    autoActivo: false,
    autoMonto: 0
  });
  
  form.reset();
  guardar();
  render();
};

const abonar = (i, cantidadManual = null) => {
  
  const cantidad = cantidadManual || Number(prompt("¿Cuánto deseas abonar?"));
  
  if (!cantidad || cantidad <= 0) return;
  
  if (cantidad > cuentas[i].saldoPendiente) {
    alert("El abono supera el saldo pendiente");
    return;
  }
  
  cuentas[i].saldoPendiente -= cantidad;
  
  cuentas[i].abonos.push({
    fecha: new Date().toLocaleString(),
    monto: cantidad
  });
  
  registrarGasto(cuentas[i].nombre, cantidad);
  
  guardar();
  render();
};

const toggleAuto = (i, estado) => {
  cuentas[i].autoActivo = estado;
  guardar();
};

const setAutoMonto = (i, valor) => {
  cuentas[i].autoMonto = Number(valor);
  guardar();
};

const eliminarCuenta = (i) => {
  cuentas.splice(i, 1);
  guardar();
  render();
};

const volver = () => {
  location.href = "index.html";
};

/* ================= AUTO ABONOS ================= */

setInterval(() => {
  cuentas.forEach((c, i) => {
    if (c.autoActivo && c.autoMonto > 0 && c.saldoPendiente > 0) {
      abonar(i, c.autoMonto);
    }
  });
}, 60000); // cada minuto

form.addEventListener("submit", agregarCuenta);

render();