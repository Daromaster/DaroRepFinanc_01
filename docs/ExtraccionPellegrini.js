(async () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const results = [];

  // Valores fijos
  const importe = 1000;
  const fechaSuscripcion = "21/03/2025";
  const fechaRescate = "21/04/2025";

  document.querySelector("#importe").value = importe;
  document.querySelector("#fecha_suscripcion").value = fechaSuscripcion;
  document.querySelector("#fecha_rescate").value = fechaRescate;

  const select = document.querySelector("#tipo_fondo");
  const options = Array.from(select.options).filter(o => o.value !== "");

  for (let i = 0; i < options.length; i++) {
    const optionText = options[i].text;
    console.log(`Procesando opción ${i + 1} de ${options.length}: ${optionText}`);

    select.selectedIndex = i + 1;
    select.dispatchEvent(new Event("change"));
    await delay(50);

    senDataSimulation();

    let attempts = 0;
    let saldo = "";
    while (saldo === "" && attempts < 30) {
      await delay(300);
      saldo = document.querySelector("#saldo").value;
      attempts++;
    }

    const resultValue = saldo || "N/A";
    console.log(`Resultado obtenido: ${resultValue}`);
    results.push([optionText, resultValue]);
  }

  const encabezado = [
    ["Importe", importe],
    ["Fecha Suscripción", fechaSuscripcion],
    ["Fecha Rescate", fechaRescate],
    [],
    ["Fondo", "Resultado"]
  ];

  const contenido = encabezado
    .concat(results)
    .map(e => e.map(v => `"${v}"`).join(","))
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
