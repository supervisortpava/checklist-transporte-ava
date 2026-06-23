import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import logoAva from "./assets/logo-ava.png";
import "./App.css";

const datosIniciales = {
  fecha: "",
  transporte: "",
  remito: "",
  patentes: "",
  origen: "",
  destino: "",
  producto: "",
  contenedor: "",
  precinto: "",
  cliente: "",
  cantidadPallets: "",
  unidades: "",
  ingresoPlanta: "Vacío",
  egresoPlanta: "Vacío",
  trabas: "",
  piernas: "",
  espejos: "",
  observacionesArmado: "",
  romaneoLotes: "",
  epp: "Sí",
  eppObs: "",
  capacitado: "Sí",
  capacitadoObs: "",
  estadoFinal: "Aceptada",
  entregaMuestras: "Sí",
};

const pallets = [
  "Integridad de film stretch",
  "Integridad del pallet",
  "Correcto estibado de cajas/charolas/termocontraíbles en el palet",
  "Palets limpios",
  "Hay evidencia de plagas",
  "Fotografía de carga",
];

const transporte = [
  "Exterior limpio",
  "Elementos de seguridad",
  "Condiciones de higiene correctas",
  "Integridad y limpieza de pared frontal",
  "Pisos uniformes y limpios",
  "No presenta olores extraños",
  "Sin mercadería en tránsito",
  "No se observan insectos",
  "No se observan nidos o excrementos de roedores",
];

const contenedor = [
  "Integridad y limpieza de pared frontal y compuertas",
  "Integridad y limpieza de pared lateral izquierda",
  "Integridad y limpieza de pared lateral derecha",
  "Integridad y limpieza de pisos",
  "Integridad y limpieza de techos/cielo",
  "Integridad de puertas dentro y fuera",
  "Integridad de sección inferior exterior",
];

const carga = [
  "Estiba adecuada",
  "Corresponde armado de circo",
  "Estado óptimo de la lona del vehículo",
  "Posee nylon para cubrir la mercadería",
];

function crearChecks(items, valorDefault = "Sí") {
  const obj = {};
  items.forEach((item) => {
    obj[item] = { valor: valorDefault, obs: "" };
  });
  return obj;
}

function formatFecha(fecha) {
  if (!fecha) return "";
  const [yyyy, mm, dd] = fecha.split("-");
  if (!yyyy || !mm || !dd) return fecha;
  return `${dd}/${mm}/${yyyy}`;
}

export default function App() {
  const [form, setForm] = useState(datosIniciales);
  const [checksPallets, setChecksPallets] = useState(crearChecks(pallets, "Sí"));
  const [checksTransporte, setChecksTransporte] = useState(crearChecks(transporte, "Sí"));
  const [checksContenedor, setChecksContenedor] = useState(crearChecks(contenedor, "Sí"));
  const [checksCarga, setChecksCarga] = useState(crearChecks(carga, "Sí"));
  const [fotos, setFotos] = useState([]);

  const cambiarDato = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cambiarCheck = (grupo, setGrupo, item, campo, valor) => {
    setGrupo({
      ...grupo,
      [item]: {
        ...grupo[item],
        [campo]: valor,
      },
    });
  };
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbypdX1QFypfa8Rr4or1zU7VNQcAI7m9vRVv6U2mOWWpSi8wji6Y50LaOSfBXNBV1l1R/exec";
const archivoABase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        nombre: file.name,
        tipo: file.type,
        base64: reader.result,
      });
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
const guardarEnSheet = async () => {
  try {
    const fotosBase64 = await Promise.all(
      fotos.map((foto) => archivoABase64(foto))
    );

    const data = {
      fecha: form.fecha,
      remito: form.remito,
      transporte: form.transporte,
      patente: form.patentes,
      cliente: form.cliente,
      producto: form.producto,
      origen: form.origen,
      destino: form.destino,
      contenedor: form.contenedor,
      precinto: form.precinto,
      trabas: form.trabas,
      piernas: form.piernas,
      espejos: form.espejos,
      estado: form.estadoFinal,
      linkFotos: "",
      fotos: fotosBase64,
    };

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });

    console.log("Guardado en Sheet y Drive");
  } catch (error) {
    console.error("Error guardando:", error);
  }
};
  const generarPDF = async (conFotos) => {
    const templateBytes = await fetch("/checklist-template.pdf").then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    const page = pdfDoc.getPages()[0];
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const escribir = (texto, x, y, size = 7) => {
      const valor = String(texto || "");
      page.drawText(valor, { x, y, size, font, color: rgb(0, 0, 0) });
    };

    const escribirCorto = (texto, x, y, max = 42, size = 7) => {
      const valor = String(texto || "");
      escribir(valor.length > max ? valor.slice(0, max) : valor, x, y, size);
    };

    const marcar = (x, y, size = 9) => {
      page.drawText("X", { x, y, size, font: bold, color: rgb(0, 0, 0) });
    };

    // DATOS DEL TRANSPORTE - coordenadas corregidas para la plantilla AVA
    escribir(formatFecha(form.fecha), 89, 724, 7);
    escribirCorto(form.transporte, 250, 724, 32, 7);
    escribirCorto(form.remito, 410, 724, 28, 7);

    escribirCorto(form.patentes, 89, 707, 30, 7);
    escribirCorto(form.origen, 250, 707, 32, 7);
    escribirCorto(form.destino, 410, 707, 35, 7);

    escribirCorto(form.producto, 89, 690, 30, 7);
    escribirCorto(form.contenedor, 250, 690, 32, 7);
    escribirCorto(form.precinto, 410, 690, 28, 7);

    escribirCorto(form.cliente, 89, 672, 55, 7);

    escribirCorto(form.cantidadPallets, 122, 653, 14, 6.5);
    escribirCorto(form.unidades, 520, 653, 14, 6.5);

    if (form.ingresoPlanta === "Vacío") marcar(184, 641);
if (form.ingresoPlanta === "Cargado") marcar(287, 641);

if (form.egresoPlanta === "Vacío") marcar(455, 641);
if (form.egresoPlanta === "Cargado") marcar(548, 641);
    // CONTROL DE PALLETS
    const yPallets = {
      "Integridad de film stretch": 614,
      "Integridad del pallet": 602,
      "Correcto estibado de cajas/charolas/termocontraíbles en el palet": 590,
      "Palets limpios": 578,
      "Hay evidencia de plagas": 566,
      "Fotografía de carga": 554,
    };

    Object.entries(yPallets).forEach(([item, y]) => {
      const valor = checksPallets[item]?.valor;
      if (valor === "Sí") marcar(374, y);
      if (valor === "No") marcar(391, y);
      const obs = checksPallets[item]?.obs;
      if (obs) escribirCorto(obs, 425, y, 28, 6.5);
    });

    // ROMANEO + ARMADO dentro del espacio grande del formulario
    escribirCorto(form.romaneoLotes, 55, 538, 85, 7);
    escribirCorto(
      `Armado: ${form.trabas || "-"} trabas / ${form.piernas || "-"} piernas / ${form.espejos || "-"} espejos`,
      55,
      463,
      85,
      7
    );
    escribirCorto(form.observacionesArmado, 55, 451, 85, 7);

    // CONTROL DE TRANSPORTE
    const yTransporte = {
      "Exterior limpio": 403,
      "Elementos de seguridad": 380,
      "Condiciones de higiene correctas": 368,
      "Integridad y limpieza de pared frontal": 357,
      "Pisos uniformes y limpios": 346,
      "No presenta olores extraños": 335,
      "Sin mercadería en tránsito": 323,
      "No se observan insectos": 312,
      "No se observan nidos o excrementos de roedores": 300,
    };

    Object.entries(yTransporte).forEach(([item, y]) => {
      const valor = checksTransporte[item]?.valor;
      if (valor === "N/A") marcar(356, y);
      if (valor === "Sí") marcar(374, y);
      if (valor === "No") marcar(391, y);
      const obs = checksTransporte[item]?.obs;
      if (obs) escribirCorto(obs, 425, y, 28, 6.5);
    });

    // CONTROL CONTENEDOR
    const yContenedor = {
      "Integridad y limpieza de pared frontal y compuertas": 278,
      "Integridad y limpieza de pared lateral izquierda": 267,
      "Integridad y limpieza de pared lateral derecha": 256,
      "Integridad y limpieza de pisos": 245,
      "Integridad y limpieza de techos/cielo": 233,
      "Integridad de puertas dentro y fuera": 222,
      "Integridad de sección inferior exterior": 211,
    };

    Object.entries(yContenedor).forEach(([item, y]) => {
      const valor = checksContenedor[item]?.valor;
      if (valor === "N/A") marcar(356, y);
      if (valor === "Sí") marcar(374, y);
      if (valor === "No") marcar(391, y);
      const obs = checksContenedor[item]?.obs;
      if (obs) escribirCorto(obs, 425, y, 28, 6.5);
    });

    // INTEGRIDAD DE LA CARGA
    const yCarga = {
      "Estiba adecuada": 188,
      "Corresponde armado de circo": 177,
      "Estado óptimo de la lona del vehículo": 165,
      "Posee nylon para cubrir la mercadería": 154,
    };

    Object.entries(yCarga).forEach(([item, y]) => {
      const valor = checksCarga[item]?.valor;
      if (valor === "N/A") marcar(356, y);
      if (valor === "Sí") marcar(374, y);
      if (valor === "No") marcar(391, y);
      const obs = checksCarga[item]?.obs;
      if (obs) escribirCorto(obs, 425, y, 28, 6.5);
    });

    // CONDUCTOR EPP
    if (form.epp === "Sí") marcar(374, 130);
    if (form.epp === "No") marcar(391, 130);
    if (form.eppObs) escribirCorto(form.eppObs, 425, 130, 28, 6.5);

    if (form.capacitado === "Sí") marcar(374, 118);
    if (form.capacitado === "No") marcar(391, 118);
    if (form.capacitadoObs) escribirCorto(form.capacitadoObs, 425, 118, 28, 6.5);

    // ESTADO FINAL Y MUESTRAS
if (form.estadoFinal === "Aceptada") marcar(185, 82);
if (form.estadoFinal === "Rechazada") marcar(270, 82);

if (form.entregaMuestras === "Sí") marcar(505, 82);
if (form.entregaMuestras === "No") marcar(570, 82);

    // FIRMA FIJA DEL JEFE DE LOGÍSTICA
    // PNG limpio con fondo transparente para que no tape líneas ni textos.
    try {
      const firmaBytes = await fetch("/firma-logistica.png").then((res) => res.arrayBuffer());
      const firma = await pdfDoc.embedPng(firmaBytes);
      page.drawImage(firma, {
        x: 92,
        y: 55,
        width: 92,
        height: 42,
      });
      escribir("Diego Cardozo", 116, 48, 6.5);
    } catch (error) {
      console.warn("No se pudo cargar la firma logística", error);
    }

    // ANEXO FOTOGRÁFICO OPCIONAL
    if (conFotos && fotos.length > 0) {
  for (let i = 0; i < fotos.length; i++) {
    try {
      const foto = fotos[i];
      const bytes = await foto.arrayBuffer();

      let image;
      if (foto.type === "image/png") {
        image = await pdfDoc.embedPng(bytes);
      } else if (foto.type === "image/jpeg" || foto.type === "image/jpg") {
        image = await pdfDoc.embedJpg(bytes);
      } else {
        console.warn("Formato no compatible:", foto.type);
        continue;
      }

      const fotoPage = pdfDoc.addPage([595.32, 841.92]);

      fotoPage.drawText("ANEXO FOTOGRÁFICO", {
        x: 50,
        y: 790,
        size: 16,
        font: bold,
      });

      fotoPage.drawText(`Remito: ${form.remito || "-"}   Patente: ${form.patentes || "-"}`, {
        x: 50,
        y: 765,
        size: 10,
        font,
      });

      fotoPage.drawText(`Foto ${i + 1} de ${fotos.length}`, {
        x: 50,
        y: 745,
        size: 10,
        font,
      });

      const maxWidth = 500;
      const maxHeight = 620;

      const scale = Math.min(
        maxWidth / image.width,
        maxHeight / image.height
      );

      const w = image.width * scale;
      const h = image.height * scale;

      fotoPage.drawImage(image, {
        x: (595.32 - w) / 2,
        y: 90,
        width: w,
        height: h,
      });
    } catch (error) {
      console.error("Error agregando foto al PDF:", error);
    }
  }
}
console.log("ANTES DE GUARDAR EN SHEET");
await guardarEnSheet();
console.log("DESPUÉS DE GUARDAR EN SHEET");

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const TablaChecks = ({ titulo, items, grupo, setGrupo, conNA = false }) => (
    <section className="card">
      <h2>{titulo}</h2>
      <table>
        <thead>
          <tr>
            <th>Ítem</th>
            {conNA && <th>N/A</th>}
            <th>Sí</th>
            <th>No</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item}>
              <td>{item}</td>
              {conNA && (
                <td>
                  <input type="radio" checked={grupo[item].valor === "N/A"} onChange={() => cambiarCheck(grupo, setGrupo, item, "valor", "N/A")} />
                </td>
              )}
              <td>
                <input type="radio" checked={grupo[item].valor === "Sí"} onChange={() => cambiarCheck(grupo, setGrupo, item, "valor", "Sí")} />
              </td>
              <td>
                <input type="radio" checked={grupo[item].valor === "No"} onChange={() => cambiarCheck(grupo, setGrupo, item, "valor", "No")} />
              </td>
              <td>
                <input value={grupo[item].obs} onChange={(e) => cambiarCheck(grupo, setGrupo, item, "obs", e.target.value)} placeholder="Observaciones" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <img src={logoAva} alt="AVA" className="logo" />
          <div>
            <h1>Control de Transporte AVA</h1>
            <p>Inspección de Higiene de Transporte</p>
          </div>
        </div>
        <span className="badge">Versión 1.0</span>
      </header>

      <section className="card">
        <h2>Datos del transporte</h2>
        <div className="grid">
          <input type="date" name="fecha" value={form.fecha} onChange={cambiarDato} />
          <input name="transporte" placeholder="Transporte" value={form.transporte} onChange={cambiarDato} />
          <input name="remito" placeholder="N° Remito" value={form.remito} onChange={cambiarDato} />
          <input name="patentes" placeholder="Patentes" value={form.patentes} onChange={cambiarDato} />
          <input name="origen" placeholder="Origen" value={form.origen} onChange={cambiarDato} />
          <input name="destino" placeholder="Destino" value={form.destino} onChange={cambiarDato} />
          <input name="producto" placeholder="Producto" value={form.producto} onChange={cambiarDato} />
          <input name="contenedor" placeholder="Contenedor" value={form.contenedor} onChange={cambiarDato} />
          <input name="precinto" placeholder="Precinto N°" value={form.precinto} onChange={cambiarDato} />
          <input name="cliente" placeholder="Cliente" value={form.cliente} onChange={cambiarDato} />
          <input name="cantidadPallets" placeholder="Cantidad de pallets/cajas" value={form.cantidadPallets} onChange={cambiarDato} />
          <input name="unidades" placeholder="Tambores / totes / unidades" value={form.unidades} onChange={cambiarDato} />
        </div>

        <div className="mini-grid">
          <label>Ingreso planta:
            <select name="ingresoPlanta" value={form.ingresoPlanta} onChange={cambiarDato}>
              <option>Vacío</option>
              <option>Cargado</option>
            </select>
          </label>
          <label>Egreso planta:
            <select name="egresoPlanta" value={form.egresoPlanta} onChange={cambiarDato}>
              <option>Vacío</option>
              <option>Cargado</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Tipo de armado</h2>
        <div className="grid">
          <input type="number" name="trabas" placeholder="Cantidad de trabas" value={form.trabas} onChange={cambiarDato} />
          <input type="number" name="piernas" placeholder="Cantidad de piernas" value={form.piernas} onChange={cambiarDato} />
          <input type="number" name="espejos" placeholder="Cantidad de espejos" value={form.espejos} onChange={cambiarDato} />
        </div>
        <textarea name="observacionesArmado" placeholder="Observaciones del armado" value={form.observacionesArmado} onChange={cambiarDato} />
      </section>

      <TablaChecks titulo="Control de pallets para carga" items={pallets} grupo={checksPallets} setGrupo={setChecksPallets} />

      <section className="card">
        <h2>Romaneo de lotes</h2>
        <textarea name="romaneoLotes" value={form.romaneoLotes} onChange={cambiarDato} placeholder="Romaneo de lotes" />
      </section>

      <TablaChecks titulo="Control de transporte" items={transporte} grupo={checksTransporte} setGrupo={setChecksTransporte} conNA />
      <TablaChecks titulo="Control contenedor" items={contenedor} grupo={checksContenedor} setGrupo={setChecksContenedor} conNA />
      <TablaChecks titulo="Integridad de la carga" items={carga} grupo={checksCarga} setGrupo={setChecksCarga} conNA />

      <section className="card">
        <h2>Conductor / EPP</h2>
        <div className="mini-grid">
          <label>Calzado, chaleco y casco:
            <select name="epp" value={form.epp} onChange={cambiarDato}>
              <option>Sí</option>
              <option>No</option>
            </select>
          </label>
          <input name="eppObs" placeholder="Observaciones EPP" value={form.eppObs} onChange={cambiarDato} />
          <label>¿Se capacitó al transportista?
            <select name="capacitado" value={form.capacitado} onChange={cambiarDato}>
              <option>Sí</option>
              <option>No</option>
            </select>
          </label>
          <input name="capacitadoObs" placeholder="Observaciones capacitación" value={form.capacitadoObs} onChange={cambiarDato} />
        </div>
      </section>

      <section className="card">
        <h2>Estado final</h2>
        <div className="mini-grid">
          <label>Estado de carga / contenedor:
            <select name="estadoFinal" value={form.estadoFinal} onChange={cambiarDato}>
              <option>Aceptada</option>
              <option>Rechazada</option>
            </select>
          </label>
          <label>Entrega de muestras:
            <select name="entregaMuestras" value={form.entregaMuestras} onChange={cambiarDato}>
              <option>Sí</option>
              <option>No</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Fotografías</h2>
        <input type="file" multiple accept="image/*" onChange={(e) => setFotos(Array.from(e.target.files))} />
        {fotos.length > 0 && <p>{fotos.length} foto/s seleccionada/s</p>}
      </section>

      <div className="actions">
        <button className="secondary" onClick={() => generarPDF(false)}>Generar PDF sin fotos</button>
        <button className="primary" onClick={() => generarPDF(true)}>Generar PDF con fotos</button>
      </div>
    </div>
  );
}
