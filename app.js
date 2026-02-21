// ================= DATA =================

let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
let cierres = JSON.parse(localStorage.getItem("cierres")) || [];

const categorias = {
  gasto: ["Transporte", "Luz", "Arriendo", "Agua", "Internet", "Comida", "Otros"],
  ingreso: ["Sueldo", "Extras", "Otros"]
};

const tipo = document.getElementById("tipo");
const categoria = document.getElementById("categoria");

// ================= CARGAR CATEGORIAS =================

const cargarCategorias = () => {
  categoria.innerHTML = "";
  categorias[tipo.value].forEach(c => {
    const o = document.createElement("option");
    o.textContent = c;
    categoria.appendChild(o);
  });
};

tipo.onchange = cargarCategorias;
cargarCategorias();

// ================= MOVIMIENTOS =================

const agregarMovimiento = () => {
  const montoInput = document.getElementById("monto");
  const descripcionInput = document.getElementById("descripcion");
  
  const monto = Number(montoInput.value);
  if (!monto) return;
  
  movimientos.push({
    tipo: tipo.value,
    categoria: categoria.value,
    descripcion: descripcionInput.value,
    monto
  });
  
  montoInput.value = "";
  descripcionInput.value = "";
  
  guardar();
  render();
};

const eliminarMovimiento = (i) => {
  movimientos.splice(i, 1);
  guardar();
  render();
};

// ================= RENDER =================

const render = () => {
  
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
  
  let saldo = 0;
  let ingresos = 0;
  let gastos = 0;
  
  movimientos.forEach((m, i) => {
    
    saldo += m.tipo === "ingreso" ? m.monto : -m.monto;
    m.tipo === "ingreso" ? ingresos += m.monto : gastos += m.monto;
    
    const li = document.createElement("li");
    
    li.innerHTML = `
      <div>
        <strong>${m.categoria}</strong>
        <div>${m.descripcion || ""}</div>
      </div>
      <div>
        $${m.monto}
        <button onclick="eliminarMovimiento(${i})">❌</button>
      </div>
    `;
    
    lista.appendChild(li);
  });
  
  document.getElementById("saldo").textContent = "$" + saldo;
  document.getElementById("ingresos").textContent = "$" + ingresos;
  document.getElementById("gastos").textContent = "$" + gastos;
};

// ================= CIERRES =================

const cerrarMes = () => {
  
  const opcion = prompt("Escribe:\n1 = Mes actual\n2 = Mes anterior");
  if (opcion === null) return;
  
  let fecha = new Date();
  
  if (opcion === "2") {
    fecha.setMonth(fecha.getMonth() - 1);
  }
  
  const nombreMes = fecha.toLocaleString("es", { month: "long", year: "numeric" });
  
  cierres.push({
    mes: nombreMes,
    saldo: document.getElementById("saldo").textContent,
    movimientos: [...movimientos]
  });
  
  movimientos = [];
  guardar();
  render();
  
  alert("Cierre guardado: " + nombreMes);
};

// ================= STORAGE =================

const guardar = () => {
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
  localStorage.setItem("cierres", JSON.stringify(cierres));
};

render();