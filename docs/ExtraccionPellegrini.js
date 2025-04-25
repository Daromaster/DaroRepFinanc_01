(async () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const importe = 1000;
  const fechaSuscripcion = "21/03/2025";
  const fechaRescate = "21/04/2025";

  document.querySelector("#importe").value = importe;
  document.querySelector("#fecha_suscripcion").value = fechaSuscripcion;
  document.querySelector("#fecha_rescate").value = fechaRescate;

  const grupos = {
    "CONSERVADORES": [
      "RENTA / Unica",
      "RENTA PESOS / Clase A",
      "RENTA FIJA / Clase A",
      "RENTA FIJA II / Clase A",
      "RENTA FIJA III / Clase A",
      "Money Market USD / Clase A"
    ],
    "BONOS": [
      "RENTA FIJA AHORRO / Clase A",
      "RENTA FIJA PLUS / Clase A",
      "RENTA FIJA PÚBLICA / Clase A",
      "RENTA DÓLARES / Clase A",
      "RENTA PÚBLICA FEDERAL / Clase A"
    ],
    "ESPECIFICOS": [
      "Pymes / Clase A",
      "Pymes / Unica",
      "Agro / Clase A",
      "DESARROLLO ARGENTINO / Clase A",
      "CRECIMIENTO / Clase A",
      "PROTECCIÓN / Clase A",
      "RETORNO TOTAL / Clase A"
    ],
    "ACCIONES": ["ACCIONES / Clase A"],
    "MIXTOS": ["INTEGRAL / Clase A"],
    "OTROS": [
      "RENTA FIJA PÚBLICA / Unica",
      "Fondo cerrado inmobiliario / Unica"
    ]
  };

  const fondosDeseados = Object.values(grupos).flat();
  const resultadosPorGrupo = {};
  Object.keys(grupos).forEach(g => resultadosPorGrupo[g] = []);

  const select = document.querySelector("#tipo_fondo");
  const options = Array.from(select.options).filter(o => o.value !== "");

  for (let i = 0; i < options.length; i++) {
    const optionText = options[i].text.trim();
    if (!fondosDeseados.includes(optionText)) continue;

    console.log(`Procesando: ${optionText}`);

    select.selectedIndex = i + 1;
    select.dispatchEvent(new Event("change"));
    await delay(50);

    senDataSimulation();

    let attempts = 0;
    let saldo = "";
    while (saldo === "" && attempts < 30) {
      await delay(100);
      saldo = document.querySelector("#saldo").value;
      attempts++;
    }

    const resultado = saldo || "N/A";
    const grupo = Object.keys(grupos).find(g => grupos[g].includes(optionText));
    resultadosPorGrupo[grupo].push([optionText, resultado]);
  }

  const encabezado = [
    ["Importe", importe],
    ["Fecha Suscripción", fechaSuscripcion],
    ["Fecha Rescate", fechaRescate],
    [],
    ["Fondo", "Resultado"]
  ];

  const contenido = encabezado
    .concat(
      Object.entries(grupos).flatMap(([grupo, lista]) => {
        const grupoResultados = resultadosPorGrupo[grupo];
        if (grupoResultados.length === 0) return [];
        return [[grupo]].concat(grupoResultados);
      })
    )
    .map(e => e.map(v => `"${v}"`).join(";"))
    .join("\n");

  const csvContent = "data:text/csv;charset=utf-8," + contenido;
  const now = new Date();
  const pad = n => n.toString().padStart(2, "0");
  const fecha = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const hora = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const filename = `resultados_simulador_${fecha}_${hora}.csv`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
})();
