const zona = document.getElementById('zonaMatriz');
const resultado = document.getElementById('resultado');
const boton = document.getElementById('crearMatriz');

boton.addEventListener('click', () => {
  const f = parseInt(document.getElementById('filas').value);
  const c = parseInt(document.getElementById('columnas').value);
  if (isNaN(f) || isNaN(c) || f <= 0 || c <= 0) {
    alert('Por favor ingresa números válidos.');
    return;
  }
  crearTabla(f, c);
});

function crearTabla(f, c) {
  let html = `
    <div class="card p-4">
      <h5 class="mb-3">Ingrese los costos, oferta y demanda</h5>
      <div class="table-responsive">
        <table class="table table-bordered tabla-inputs">
          <thead>
            <tr>
              <th>Origen \\ Destino</th>`;
  for (let j = 0; j < c; j++) html += `<th>D${j + 1}</th>`;
  html += `<th>Oferta</th></tr></thead><tbody>`;

  for (let i = 0; i < f; i++) {
    html += `<tr><th>S${i + 1}</th>`;
    for (let j = 0; j < c; j++) {
      html += `<td><input type="number" id="c_${i}_${j}" class="form-control" min="0" value="0"></td>`;
    }
    html += `<td><input type="number" id="oferta_${i}" class="form-control" min="0" value="0"></td></tr>`;
  }

  html += `<tr><th>Demanda</th>`;
  for (let j = 0; j < c; j++) {
    html += `<td><input type="number" id="demanda_${j}" class="form-control" min="0" value="0"></td>`;
  }
  html += `<td></td></tr></tbody></table></div>
      <div class="text-center mt-3">
        <button class="btn btn-success" id="calcular">Calcular Costo Mínimo</button>
      </div>
    </div>
  `;
  zona.innerHTML = html;

  document.getElementById('calcular').addEventListener('click', () => {
    resolver(f, c);
  });
}

function resolver(f, c) {
  const costos = [];
  const oferta = [];
  const demanda = [];
  for (let i = 0; i < f; i++) {
    const fila = [];
    for (let j = 0; j < c; j++) {
      const valor = Number(document.getElementById(`c_${i}_${j}`).value);
      fila.push(valor);
    }
    costos.push(fila);
    oferta.push(Number(document.getElementById(`oferta_${i}`).value));
  }
  for (let j = 0; j < c; j++) {
    demanda.push(Number(document.getElementById(`demanda_${j}`).value));
  }

  const sumaOferta = oferta.reduce((a, b) => a + b, 0);
  const sumaDemanda = demanda.reduce((a, b) => a + b, 0);
  if (sumaOferta !== sumaDemanda) {
    alert(`Problema no balanceado.\nOferta total: ${sumaOferta}\nDemanda total: ${sumaDemanda}\n\nPor favor, balancee el problema.`);
    return;
  }

  let disponibleO = [...oferta];
  let disponibleD = [...demanda];

  const asignacion = Array.from({ length: f }, () => Array(c).fill(0));
  
  const pasos = [];

  while (true) {
    let menor = Infinity;
    let pf = -1;
    let pc = -1;

    for (let i = 0; i < f; i++) {
      for (let j = 0; j < c; j++) {
        if (disponibleO[i] > 0 && disponibleD[j] > 0 && costos[i][j] < menor) {
          menor = costos[i][j];
          pf = i;
          pc = j;
        }
      }
    }

    if (pf === -1) break;

    const cant = Math.min(disponibleO[pf], disponibleD[pc]);
    asignacion[pf][pc] = cant;

    pasos.push({
      origen: pf + 1,
      destino: pc + 1,
      cantidad: cant,
      costo: costos[pf][pc],
      total: cant * costos[pf][pc]
    });

    disponibleO[pf] -= cant;
    disponibleD[pc] -= cant;
  }

  let total = 0;
  for (let i = 0; i < f; i++) {
    for (let j = 0; j < c; j++) {
      total += asignacion[i][j] * costos[i][j];
    }
  }

  mostrar(asignacion, total, pasos, costos);
}

function mostrar(asignacion, total, pasos, costos) {
  let html = `<div class="card p-4">
    <h5 class="mb-4">Resultado del Método de Costo Mínimo</h5>
    
    <div class="row">
      <div class="col-md-6">
        <h6>Matriz de Asignaciones</h6>
        <table class="table table-bordered text-center mt-3">
          <thead class="table-light">
            <tr>
              <th>Origen \\ Destino</th>`;
  
  for (let j = 0; j < asignacion[0].length; j++) html += `<th>D${j + 1}</th>`;
  html += `</tr></thead><tbody>`;

  for (let i = 0; i < asignacion.length; i++) {
    html += `<tr><th class="table-light">S${i + 1}</th>`;
    for (let j = 0; j < asignacion[0].length; j++) {
      const val = asignacion[i][j] > 0 ? asignacion[i][j] : '-';
      const bg = asignacion[i][j] > 0 ? 'style="background-color: #d4edda;"' : '';
      html += `<td ${bg}><strong>${val}</strong><br><small class="text-muted">(${costos[i][j]})</small></td>`;
    }
    html += `</tr>`;
  }

  html += `</tbody></table>
      </div>
      
      <div class="col-md-6">
        <h6>Política de Entrega (Logística)</h6>
        <div class="bg-light p-3 rounded mt-3">
          <p class="mb-2"><strong>Cantidad × Costo</strong></p>`;
  
  pasos.forEach(p => {
    html += `<div class="mb-1">
      S${p.origen} → D${p.destino} &nbsp;&nbsp; 
      <span class="text-primary">${p.cantidad}</span> × 
      <span class="text-success">${p.costo}</span> = 
      <span class="text-danger">${p.total}</span>
    </div>`;
  });
  
  html += `<hr>
          <div class="fw-bold fs-5 text-center">
            Costo Total Transporte = $ ${total.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
    
    <div class="alert alert-success mt-4 text-center">
      <strong>Costo Total Mínimo: $ ${total.toLocaleString()}</strong>
    </div>
  </div>`;
  
  resultado.innerHTML = html;
}