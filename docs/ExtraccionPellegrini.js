(async () => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const results = [];

  // --- Función para corregir errores de codificación en los textos ---
  const fixEncoding = str => {
    try {
      const bytes = new Uint8Array([...str].map(c => c.charCodeAt(0)));
      return new TextDecoder("utf-8").decode(bytes);
    } catch (e) {
      // Reemplazos manuales para casos comunes si falla
      return str
        .replace("Ã“", "Ó")
        .replace("Ã¡", "á")
        .replace("Ã©", "é")
        .replace("Ã­", "í")
        .replace("Ã³", "ó")
        .replace("Ãº", "ú")
        .replace("Ã‘", "Ñ")
        .replace("Ã±", "ñ");
    }
  };

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
    const rawText = options[i].text;
    const optionText = fixEncoding(rawText);
    console.log(`Procesando opción ${i + 1} de ${options.length}: ${optionText}`);

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
