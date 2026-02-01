const tipo=document.getElementById("tipo");
const categoria=document.getElementById("categoria");
const desc=document.getElementById("desc");
const monto=document.getElementById("monto");
const lista=document.getElementById("lista");
const canvasGrafico=document.getElementById("grafico");
const modo=document.getElementById("modo");

let chart=null;

const categorias={
gasto:["Transporte","Luz","Arriendo","Agua","Internet","Comida","Salud","Educación","Otros"],
ingreso:["Sueldo","Extras","Ventas","Otros"]
};

const IA={
luz:"Luz",agua:"Agua",internet:"Internet",
arriendo:"Arriendo",uber:"Transporte",
comida:"Comida",farmacia:"Salud"
};

let state=JSON.parse(localStorage.getItem("finanzas"))||{
meses:{},
reglas:{},
recurrentes:[]
};

const mesActual=new Date().toISOString().slice(0,7);

if(!state.meses[mesActual]){
state.meses[mesActual]={mov:[]};
}

function save(){
localStorage.setItem("finanzas",JSON.stringify(state));
}

function cargarCategorias(){
categoria.innerHTML="";
categorias[tipo.value].forEach(c=>{
categoria.innerHTML+=`<option>${c}</option>`;
});
}

tipo.addEventListener("change",cargarCategorias);
cargarCategorias();

if("Notification"in window)Notification.requestPermission();

function notificar(t,b){
if(Notification.permission==="granted"){
new Notification(t,{body:b});
}
}

function aplicarReglas(t){
t=t.toLowerCase();

for(let k in state.reglas){
if(t.includes(k)) return state.reglas[k];
}

for(let k in IA){
if(t.includes(k)) return IA[k];
}

return null;
}

function agregar(){

const t=tipo.value;
const d=desc.value;
const m=Number(monto.value);
let c=categoria.value;

const ai=aplicarReglas(d);
if(ai) c=ai;
else state.reglas[d.toLowerCase()]=c;

state.meses[mesActual].mov.push({
id:Date.now(),
t,c,d,m
});

if(t==="gasto") notificar("Nuevo gasto",`${c} $${m}`);

desc.value="";
monto.value="";

save();
render();
}

function render(){

lista.innerHTML="";

state.meses[mesActual].mov.forEach(x=>{
lista.innerHTML+=`
<div class="item">
<span>${x.d} (${x.c})</span>
<strong>${x.t==="gasto"?"-":"+"}$${x.m}</strong>
</div>`;
});

graf();
}

function graf(){

if(chart) chart.destroy();

const meses=Object.keys(state.meses).slice(-3);

let ingresos=[];
let gastos=[];

meses.forEach(m=>{
let i=0,g=0;
state.meses[m].mov.forEach(x=>{
x.t==="ingreso"?i+=x.m:g+=x.m;
});
ingresos.push(i);
gastos.push(g);
});

chart=new Chart(canvasGrafico,{
type:"bar",
data:{
labels:meses,
datasets:[
{label:"Ingresos",data:ingresos},
{label:"Gastos",data:gastos}
]
}
});
}

function pagoAutomatico(){
const d=prompt("Descripción");
const m=Number(prompt("Monto"));
const c=prompt("Categoría");
state.recurrentes.push({d,m,c});
save();
alert("Autopago creado");
}

state.recurrentes.forEach(p=>{
state.meses[mesActual].mov.push({
id:Date.now()+Math.random(),
t:"gasto",
d:p.d,
m:p.m,
c:p.c
});
});

modo.onclick=()=>{
document.body.classList.toggle("dark");
};

render();