// ============================================
// IMPORTADOR DE DOCUMENTOS TRIBUTARIOS (PDF)
// Lee BHE y facturas electrónicas del SII EN EL NAVEGADOR,
// extrae los datos y DESCARTA el archivo (no se guarda copia).
// ============================================
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MESES = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
};

const parseMonto = (str) => {
  if (!str) return null;
  const limpio = String(str).replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
  const n = parseFloat(limpio);
  return isNaN(n) ? null : Math.round(n);
};

const parseFechaTexto = (texto) => {
  let m = texto.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+(?:de\s+|del\s+)?(\d{4})/i);
  if (m) {
    const mes = MESES[m[2].toLowerCase()];
    if (mes) return `${m[3]}-${String(mes).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
  }
  m = texto.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m) return `${m[3]}-${String(+m[2]).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
  m = texto.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[0];
  return null;
};

// Extrae el texto del PDF agrupado por líneas (usa posición Y de cada fragmento)
export const extraerLineasPDF = async (file) => {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const lineas = [];
  for (let p = 1; p <= Math.min(pdf.numPages, 3); p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const porY = {};
    content.items.forEach(it => {
      const y = Math.round(it.transform[5] / 3) * 3;
      (porY[y] = porY[y] || []).push({ x: it.transform[4], str: it.str });
    });
    Object.keys(porY).map(Number).sort((a, b) => b - a).forEach(y => {
      const linea = porY[y].sort((a, b) => a.x - b.x).map(i => i.str).join(' ').replace(/\s+/g, ' ').trim();
      if (linea) lineas.push(linea);
    });
  }
  return lineas;
};

// Interpreta las líneas: tipo de documento, folio, fecha, tercero y montos
export const parsearDocumentoTributario = (lineas, rutEmpresa = '') => {
  const texto = lineas.join('\n');
  const avisos = [];
  const norm = (r) => String(r || '').replace(/[.\s]/g, '').toUpperCase();

  const esBHE = /BOLETA[S]?\s+DE\s+HONORARIOS/i.test(texto);
  const esFactura = /FACTURA/i.test(texto);

  let folio = null;
  let m = texto.match(/N[°ºO]?\s*[:.]?\s*(\d{1,10})/i);
  if (m) folio = m[1];

  const fecha = parseFechaTexto(texto);
  if (!fecha) avisos.push('No se detectó la fecha — revísala');

  const ruts = [...texto.matchAll(/(\d{1,2}\.?\d{3}\.?\d{3}\s?-\s?[\dkK])/g)].map(x => x[1].replace(/\s/g, ''));

  if (esBHE) {
    const cand = lineas.find(l => /[A-ZÁÉÍÓÚÑ]{3,}/.test(l) && !/BOLETA|HONORARIOS|ELECTRONIC|SII|FECHA|N°|Nº/i.test(l));
    const tercero = cand ? cand.slice(0, 60).trim() : null;
    if (!tercero) avisos.push('No se detectó el emisor — complétalo');
    let bruto = null;
    m = texto.match(/TOTAL\s+HONORARIOS\s*:?\s*\$?\s*([\d.,]+)/i) ||
        texto.match(/MONTO\s+BRUTO\s*:?\s*\$?\s*([\d.,]+)/i) ||
        texto.match(/HONORARIOS\s*:?\s*\$\s*([\d.,]+)/i);
    if (m) bruto = parseMonto(m[1]);
    if (!bruto) avisos.push('No se detectó el monto bruto');
    return { tipo: 'bh', fecha, tercero, folio, bruto, neto: null, iva: null, total: null, avisos };
  }

  if (esFactura) {
    let neto = null, iva = null, total = null;
    m = texto.match(/(?:MONTO\s+)?NETO\s*:?\s*\$?\s*([\d.,]+)/i);
    if (m) neto = parseMonto(m[1]);
    m = texto.match(/I\.?\s?V\.?\s?A\.?[^0-9$]{0,15}\$?\s*([\d.,]+)/i);
    if (m) iva = parseMonto(m[1]);
    const totales = [...texto.matchAll(/TOTAL\s*:?\s*\$?\s*([\d.,]+)/gi)].map(x => parseMonto(x[1])).filter(Boolean);
    if (totales.length) total = Math.max(...totales);
    if (neto === null && total !== null && iva !== null) neto = total - iva;
    if (neto !== null && iva === null) { iva = Math.round(neto * 0.19); avisos.push('IVA estimado al 19% — verifícalo'); }
    if (neto === null) avisos.push('No se detectó el monto neto');

    // Clasificación compra/venta según quién emite (primer RUT del documento)
    let tipo = 'compra';
    let tercero = null;
    const propio = norm(rutEmpresa);
    if (propio && ruts.length && norm(ruts[0]) === propio) {
      tipo = 'venta';
      m = texto.match(/SE[NÑ]OR(?:\(ES\)|ES)?\s*:?\s*([^\n]{3,60})/i);
      tercero = m ? m[1].trim() : null;
      if (!tercero) avisos.push('No se detectó el cliente — complétalo');
    } else {
      const cand = lineas.find(l => /[A-ZÁÉÍÓÚÑ]{3,}/.test(l) && !/FACTURA|ELECTRONIC|SII|R\.?U\.?T|FECHA|GIRO|CASA\s+MATRIZ/i.test(l));
      tercero = cand ? cand.slice(0, 60).trim() : null;
      if (!tercero) avisos.push('No se detectó el proveedor — complétalo');
      if (!propio) avisos.push('Configura el RUT de AFOR para clasificar compra/venta automáticamente');
    }
    return { tipo, fecha, tercero, folio, bruto: null, neto, iva, total, avisos };
  }

  return { tipo: 'compra', fecha, tercero: null, folio, bruto: null, neto: null, iva: null, total: null, avisos: ['Tipo de documento no reconocido — completa los datos a mano'] };
};
