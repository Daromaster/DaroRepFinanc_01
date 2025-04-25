(async () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const results = [];

  const importe = 1000;

  const fechaSuscripcion = document.querySelector("#fecha_suscripcion").value.trim();
  const fechaRescate = document.querySelector("#fecha_rescate").value.trim();

  if (!fechaSuscripcion || !fechaRescate) {
    alert("Por favor completá las fechas de Suscripción y Rescate antes de ejecutar la función.");
    return;
  }

  document.querySelector("#importe").value = importe;

  const gruposFondos = {
    "CONSERVADORES": [
      "RENTA / Unica", "RENTA PESOS / Clase A", "RENTA FIJA / Clase A",
      "RENTA FIJA II / Clase A", "RENTA FIJA III / Clase A", "Money Market USD / Clase A"
    ],
    "BONOS": [
      "RENTA FIJA AHORRO / Clase A", "RENTA FIJA PLUS / Clase A",
      "RENTA FIJA PÚBLICA / Clase A", "RENTA DÓLARES / Clase A",
      "RENTA PÚBLICA FEDERAL / Clase A"
    ],
    "ESPECIFICOS": [
      "Pymes / Clase A", "Pymes / Unica", "Agro / Clase A", "DESARROLLO ARGENTINO / Clase A",
      "CRECIMIENTO / Clase A", "PROTECCIÓN / Clase A", "RETORNO TOTAL / Clase A"
    ],
    "ACCIONES": ["ACCIONES / Clase A"],
    "MIXTOS": ["INTEGRAL / Clase A"],
    "OTROS": ["RENTA FIJA PÚBLICA / Unica", "Fondo cerrado inmobiliario / Unica"]
  };

  const fondosPermitidos = Object.values(gruposFondos).flat();

  const select = document.querySelector("#tipo_fondo");
  const options = Array.from(select.options).filter(o => o.value !== "");

  for (let i = 0; i < options.length; i++) {
    const optionText = options[i].text.trim();
    if (!fondosPermitidos.includes(optionText)) continue;

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

    const resultValue = saldo || "N/A";
    results.push([optionText, resultValue]);
  }

  const resultadosAgrupados = [];
  for (const [grupo, fondos] of Object.entries(gruposFondos)) {
    const grupoResultados = fondos
      .map(nombre => results.find(([n]) => n === nombre))
      .filter(Boolean);
    if (grupoResultados.length > 0) {
      resultadosAgrupados.push([[], [`${grupo}`]]);
      resultadosAgrupados.push(...grupoResultados);
    }
  }

  const encabezado = [
    ["Importe", importe],
    ["Fecha Suscripción", fechaSuscripcion],
    ["Fecha Rescate", fechaRescate],
    [],
    ["Fondo", "Resultado"]
  ];

  const contenido = encabezado
    .concat(resultadosAgrupados)
    .map(e => e.map(v => `"${v}"`).join(";"))
    .join("\n");

  const csvContent = "data:text/csv;charset=utf-8," + contenido;

  const now = new Date();
  const pad = n => n.toString().padStart(2, "0");
  const fecha = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const hora = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const filename = `resultados_simulador_${fecha}_${hora}.csv`;

  console.log(`Generando archivo: ${filename}`);

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
})();
