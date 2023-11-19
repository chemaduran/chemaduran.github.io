// on load window event, print on console.log "start"

let info_centros;
let info_ciclos;
let items;
let oferta = new Map();
let filtro_localidad;
let filtro_turno;
let filtro_ciclo;

window.onload = function () {
  // get the element with id "ciclo" and add an event listener on change
  let ciclo_select = document.getElementById("ciclo");
  ciclo_select.addEventListener("change", function () {
    let ciclo = ciclo_select.value;
    filtro_ciclo = ciclo;
    process_items();
    generate_table();
  });

  // get the element with id "turno" and add an event listener on change
  let turno_select = document.getElementById("turno");
  turno_select.addEventListener("change", function () {
    let turno = turno_select.value;
    filtro_turno = turno;
    process_items();
    generate_table();
  });

  // get the element with id "localidad" and add an event listener on change
  let localidad_select = document.getElementById("localidad");
  localidad_select.addEventListener("change", function () {
    let localidad = localidad_select.value;
    filtro_localidad = localidad;
    process_items();
    generate_table();
  });

  // make a request to cherupelis.ddns.net/ofertafp and process the response. Do it with fetch api
  fetch("ofertas.json")
    .then((response) => response.json())
    .then((data) => {
      info_centros = data.info_centros;
      info_ciclos = data.info_ciclos;
      items = data.items;

      let ciclos_ordenados = new Map();

      for (const key in info_ciclos) {
        if (Object.hasOwnProperty.call(info_ciclos, key)) {
          if (key != "")
            ciclos_ordenados.set(info_ciclos[key].nombre_ciclo, key);
        }
      }

      var mapAsc = new Map([...ciclos_ordenados.entries()].sort());
      let ciclo_select = document.getElementById("ciclo");
      ciclo_select.innerHTML = `<option value="none">Elige...</option>`;
      for (let [key, value] of mapAsc) {
        ciclo_select.innerHTML += `<option value="${value}">${key}</option>`;
      }

      process_items();
      generate_table();
    });

  // get the element with id "tabla" and generate a table with 10 rows and 4 columns
};

function process_items() {
  oferta = new Map();

  let turnos = new Set();

  items.forEach((e) => {
    let c = search_centro_by_code(e.c);
    turnos.add(e.tu);

    let centro = {
      codigo: c.c,
      nombre: c.n,
      direccion: c.d,
      telefono: c.t,
      localidad: c.l,
      codigo_provincia: c.cp,
    };

    let ciclo = {
      codigo_ciclo: e.cc,
      nombre: get_ciclo_name_by_code(e.cc),
      tipo: e.t,
      turno: e.tu,
      bilingüe: e.b,
    };

    insert_filtering(centro, ciclo);
  });

  let turno = document.getElementById("turno");
  turno.innerHTML = `<option value="none">Elige...</option>`;
  for (const t of turnos) {
    turno.innerHTML += `<option value="${t}">${t}</option>`;
  }

  console.log(oferta);
}

function insert_filtering(centro, ciclo) {
  if (
    filtro_localidad != null &&
    filtro_localidad != "none" &&
    filtro_localidad != centro.codigo_provincia
  )
    return;
  key_centro = search_centro_in_oferta(centro.codigo);
  if (key_centro != null) {
    oferta.get(key_centro).push(ciclo);
  } else {
    oferta.set(centro, [ciclo]);
  }
}

function search_centro_in_oferta(code) {
  // search in oferta by code and return true or false
  let has_centro = null;

  for (let [key, value] of oferta) {
    if (key.codigo == code) {
      has_centro = key;
      break;
    }
  }
  return has_centro;
}

function generate_table() {
  console.log("generate_table");

  let table = document.getElementById("tabla_data");
  table.innerHTML = "";

  for (let [key, value] of oferta) {
    if (filtro_turno != null && filtro_turno != "none") {
      if (!ciclo_has_turno(value, filtro_turno)) {
        console.log("no tiene turno");
        continue;
      }
    }

    if (filtro_ciclo != null && filtro_ciclo != "none") {
      if (!ciclo_has_name(value, filtro_ciclo)) {
        console.log("no tiene el ciclo");
        continue;
      }
    }

    let row = table.insertRow(0);
    let cell = row.insertCell(0);
    cell.innerHTML = key.codigo;
    cell = row.insertCell(1);
    cell.innerHTML = key.nombre;
    cell = row.insertCell(2);
    cell.innerHTML = key.localidad;
    cell = row.insertCell(3);
    cell_turno = row.insertCell(4);
    for (let i = 0; i < value.length; i++) {
      cell.innerHTML += value[i].nombre + "<br>";
      cell_turno.innerHTML += value[i].turno + "<br>";
    }
  }
}

function ciclo_has_turno(ciclo, filtro_turno) {
  // search in ciclo by turno and return true or false
  let has_turno = false;

  for (let i = 0; i < ciclo.length; i++) {
    if (ciclo[i].turno == filtro_turno) {
      has_turno = true;
      break;
    }
  }
  return has_turno;
}

function ciclo_has_name(ciclo, filtro_ciclo) {
  // search in centro by ciclo and return true or false
  let has_ciclo = false;

  for (let i = 0; i < ciclo.length; i++) {
    if (ciclo[i].codigo_ciclo == filtro_ciclo) {
      has_ciclo = true;
      break;
    }
  }
  return has_ciclo;
}

function get_ciclo_name_by_code(code) {
  return info_ciclos[code].nombre_ciclo;
}

function search_centro_by_code(code) {
  let centro;

  info_centros.forEach((e) => {
    if (e.c == code) {
      centro = e;
      return;
    }
  });
  return centro;
}
