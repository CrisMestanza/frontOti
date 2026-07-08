import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import Swal from "sweetalert2";
import styles from "../dashboard/Dashboard.module.css";
import styles2 from "./Boletas.module.css";
import SideNav from "../../components/SideNav";
import TopNav from "../../components/TopNav";
import MobileNav from "../../components/MobileNav";
import { API } from "../../conf/api";
import { numeroALetras } from "../../utils/numeroALetras";

// Encabezado fijo de la institución, no proviene de la API.
const ENCABEZADO = [
    "Universidad Nacional de San Martín",
    "RUC: 20160766191",
    "Jr. Amorarca N° 315 - Morales -",
    "Ciudad Universitaria",
];

function obtenerAnio(fecha) {
    if (!fecha) return "";
    const anio = String(fecha).slice(0, 4);
    return /^\d{4}$/.test(anio) ? anio : "";
}

function formatMonto(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero.toFixed(2) : String(valor ?? "");
}

function agruparBoletas(rows) {
    const grupos = {};

    rows.forEach((row) => {
        const recibo = row["RECIBO DE PAGO"];

        if (!grupos[recibo]) {
            grupos[recibo] = {
                recibo,
                cliente: row["Cliente"],
                direccion: row["Direc."],
                fecha: row["Fecha Emis."],
                hora: row["Hora"],
                moneda: row["Moneda"],
                subtotal: row["Sub.Total"],
                total: row["TOTAL S/"],
                efectivo: row["Efectivo"],
                usuario: row["Usuario"],
                items: [],
            };
        }

        grupos[recibo].items.push({
            descripcion: row["Descripcion"],
            cantidad: row["Cantidad"],
            unidad: row["Unidad"],
            precio: row["Precio"],
            total: row["Total"],
        });
    });

    return Object.values(grupos);
}

// Dibuja el ticket completo sobre `doc` y devuelve la posición Y final,
// para poder medir el alto real antes de generar el PDF definitivo.
function dibujarBoleta(doc, boleta, anchoTicket, margenX, margenDer) {
    const centro = anchoTicket / 2;
    let y = 8;

    const linea = (texto, opts = {}) => {
        doc.text(String(texto ?? ""), opts.x ?? centro, y, { align: opts.align ?? "center" });
        y += opts.salto ?? 4;
    };

    const punteado = () => {
        doc.setLineDashPattern([0.8, 0.8], 0);
        doc.setLineWidth(0.15);
        doc.line(margenX, y, margenDer, y);
        doc.setLineDashPattern([], 0);
        y += 4;
    };

    // Todo el ticket en negrita, igual que el recibo original de la ticketera.
    doc.setFont("courier", "bold");

    // ── ENCABEZADO INSTITUCIONAL (estático) ──
    doc.setFontSize(9.5);
    linea(ENCABEZADO[0]);

    doc.setFontSize(7.3);
    ENCABEZADO.slice(1).forEach((texto) => linea(texto, { salto: 3.6 }));

    y += 6;
    doc.setFontSize(8.5);
    linea("TESORERÍA-CAJA", { salto: 10 });

    doc.setFontSize(9.5);
    linea("RECIBO DE PAGO");
    doc.setFontSize(11);
    linea(boleta.recibo, { salto: 7 });

    // ── DATOS DEL CLIENTE ──
    doc.setFontSize(8);
    const offsetValor = 24;

    // Campo de una sola línea (valores cortos y de longitud conocida).
    const campo = (label, value, offset = offsetValor) => {
        doc.text(label, margenX, y);
        doc.text(String(value ?? ""), margenX + offset, y);
    };

    // Campo que envuelve el texto si no cabe en el ancho del ticket
    // (evita que nombres/direcciones largas se corten en el margen).
    const campoMultilinea = (label, value, offset = offsetValor) => {
        doc.text(label, margenX, y);
        const anchoDisponible = margenDer - (margenX + offset);
        const lineas = doc.splitTextToSize(String(value ?? ""), anchoDisponible);
        doc.text(lineas, margenX + offset, y);
        y += Math.max(lineas.length, 1) * 4.3;
    };

    campoMultilinea("Cliente", boleta.cliente);
    campo("Doc. Ident.", ""); // No se muestra el documento en la boleta
    y += 4.3;
    campo("Direc.", ""); // No se muestra la dirección en la boleta
    y += 4.3;

    // Fecha Emis. y Hora comparten la misma fila, como en el recibo original.
    doc.text("Fecha Emis.", margenX, y);
    doc.text(String(boleta.fecha ?? ""), margenX + offsetValor, y);
    doc.text("Hora", margenX + 46, y);
    doc.text(String(boleta.hora ?? ""), margenX + 58, y);
    y += 4.3;

    campo("Moneda", "Soles");
    y += 4;

    punteado();

    // ── DETALLE DE ITEMS (columnas fijas, iguales en encabezado y datos) ──
    const colCant = margenX;
    const colUnd = margenX + 14;
    const colPrecio = margenDer - 20;
    const colTotal = margenDer;

    doc.setFontSize(7.8);
    doc.text("Cant.", colCant, y);
    doc.text("Und", colUnd, y);
    doc.text("Precio", colPrecio, y, { align: "right" });
    doc.text("Total", colTotal, y, { align: "right" });
    y += 3;
    punteado();

    boleta.items.forEach((item) => {
        doc.setFontSize(7.8);
        const desc = doc.splitTextToSize(String(item.descripcion ?? ""), anchoTicket - margenX * 2);
        doc.text(desc, margenX, y);
        y += desc.length * 3.4 + 0.6;

        doc.setFontSize(8);
        doc.text(String(item.cantidad ?? ""), colCant, y);
        doc.text(String(item.unidad ?? ""), colUnd, y);
        doc.text(formatMonto(item.precio), colPrecio, y, { align: "right" });
        doc.text(formatMonto(item.total), colTotal, y, { align: "right" });
        y += 4.6;
    });

    punteado();
    y += 2;

    // ── TOTALES (bloque alineado a la derecha, como en el recibo original) ──
    doc.setFontSize(8.5);
    doc.text(`Sub.Total    ${formatMonto(boleta.subtotal)}`, margenDer, y, { align: "right" });
    y += 5;

    doc.setFontSize(9.5);
    doc.text(`TOTAL S/    ${formatMonto(boleta.total)}`, margenDer, y, { align: "right" });
    y += 7;

    // ── MONTO EN LETRAS (el "CON" siempre cae al final de la primera línea) ──
    doc.setFontSize(7.5);
    const anchoDisponibleSon = anchoTicket - margenX * 2;
    const [parteEntera, parteDecimal = ""] = numeroALetras(boleta.total).split(" CON ");

    const lineaEntera = doc.splitTextToSize(`Son: ${parteEntera} CON`, anchoDisponibleSon);
    doc.text(lineaEntera, margenX, y);
    y += lineaEntera.length * 3.4;

    const lineaDecimal = doc.splitTextToSize(parteDecimal, anchoDisponibleSon);
    doc.text(lineaDecimal, margenX, y);
    y += lineaDecimal.length * 3.4 + 5;

    // ── PIE ──
    doc.setFontSize(8);
    doc.text(String(boleta.efectivo ?? ""), margenX, y);
    y += 5;
    doc.text(`Usuario: ${boleta.usuario ?? ""}`, margenX, y);
    y += 25;

    return y;
}

function generarBoletaPDF(boleta) {
    const anchoTicket = 80;
    const margenX = 5;
    const margenDer = anchoTicket - 5;

    // 1) Documento de medición: dibuja el ticket en una hoja alta de sobra
    //    para averiguar cuánto espacio ocupa realmente el contenido.
    const medidor = new jsPDF({ unit: "mm", format: [anchoTicket, 400] });
    const altoReal = dibujarBoleta(medidor, boleta, anchoTicket, margenX, margenDer);

    // 2) Documento final, con el alto exacto (sin sobras ni recortes).
    const doc = new jsPDF({ unit: "mm", format: [anchoTicket, altoReal] });
    dibujarBoleta(doc, boleta, anchoTicket, margenX, margenDer);

    doc.save(`boleta_${boleta.recibo}.pdf`);
}

export default function Boletas() {
    const [periodos, setPeriodos] = useState([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");
    const [dni, setDni] = useState("");
    const [boletas, setBoletas] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [buscado, setBuscado] = useState(false);

    const fetchPeriodos = async () => {
        try {
            const res = await axios.get(API.getPeriodoTerm);
            setPeriodos(res.data);
        } catch {
            Swal.fire("Error", "No se pudo cargar la lista de procesos", "error");
        }
    };

    useEffect(() => {
        fetchPeriodos();
    }, []);

    const buscarBoletas = async () => {
        if (!periodoSeleccionado) {
            Swal.fire("Falta el proceso", "Selecciona un proceso/periodo", "warning");
            return;
        }
        if (!dni) {
            Swal.fire("Falta el DNI", "Ingresa el número de documento", "warning");
            return;
        }

        setBuscando(true);
        setBuscado(false);

        try {
            const res = await axios.get(API.getBoletas(periodoSeleccionado, dni));
            setBoletas(agruparBoletas(res.data || []));
        } catch {
            Swal.fire("Error", "No se pudo obtener la información de la boleta", "error");
            setBoletas([]);
        } finally {
            setBuscando(false);
            setBuscado(true);
        }
    };

    return (
        <div className={styles.wrapper}>
            <TopNav />
            <SideNav />

            <main className={styles.main}>
                <div className={styles2.header}>
                    <div className={styles2.headerLeft}>
                        <div className={styles2.headerIcon}>
                            <span className="material-symbols-outlined">receipt_long</span>
                        </div>
                        <div>
                            <h1 className={styles2.headerTitle}>Boletas de Pago</h1>
                            <p className={styles2.headerSubtitle}>
                                Consulta y descarga la boleta de admisión por proceso y DNI
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.contentInner}>
                    <div className={styles2.filters}>
                        <div className={styles2.fieldGroup}>
                            <span className={`material-symbols-outlined ${styles2.fieldIcon}`}>event_note</span>
                            <select
                                className={styles2.select}
                                value={periodoSeleccionado}
                                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                            >
                                <option value="">-- Seleccionar Proceso --</option>
                                {periodos.map((p) => (
                                    <option key={p.Id} value={p.Id}>
                                        {p.Name}{obtenerAnio(p.CreatedAt) && ` - ${obtenerAnio(p.CreatedAt)}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles2.fieldGroup}>
                            <span className={`material-symbols-outlined ${styles2.fieldIcon}`}>badge</span>
                            <input
                                type="text"
                                className={styles2.input}
                                placeholder="Ingresar DNI"
                                value={dni}
                                onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                                maxLength={8}
                            />
                        </div>

                        <button
                            className={styles2.btnBuscar}
                            onClick={buscarBoletas}
                            disabled={buscando}
                        >
                            <span className="material-symbols-outlined">search</span>
                            {buscando ? "Buscando..." : "Buscar"}
                        </button>
                    </div>

                    {buscado && boletas.length === 0 && (
                        <div className={styles2.sinResultados}>
                            <span className="material-symbols-outlined">search_off</span>
                            No se encontraron boletas para el DNI y proceso seleccionados.
                        </div>
                    )}

                    {boletas.length > 0 && (
                        <div className={styles2.boletasGrid}>
                            {boletas.map((boleta) => (
                                <div key={boleta.recibo} className={styles2.boletaCard}>
                                    <div className={styles2.boletaCardHeader}>
                                        <div className={styles2.boletaReciboBox}>
                                            <div className={styles2.boletaReciboIcon}>
                                                <span className="material-symbols-outlined">receipt</span>
                                            </div>
                                            <div>
                                                <span className={styles2.boletaReciboLabel}>Recibo</span>
                                                <span className={styles2.boletaRecibo}>{boleta.recibo}</span>
                                            </div>
                                        </div>
                                        <span className={styles2.chipMoneda}>{boleta.moneda}</span>
                                    </div>

                                    <div className={styles2.boletaCliente}>
                                        <span className="material-symbols-outlined">person</span>
                                        {boleta.cliente}
                                    </div>

                                    <div className={styles2.boletaMeta}>
                                        <span>
                                            <span className="material-symbols-outlined">event</span>
                                            {boleta.fecha}
                                        </span>
                                        <span>
                                            <span className="material-symbols-outlined">schedule</span>
                                            {boleta.hora}
                                        </span>
                                    </div>

                                    <div className={styles2.divider} />

                                    <table className={styles2.itemsTable}>
                                        <thead>
                                            <tr>
                                                <th>Descripción</th>
                                                <th>Cant.</th>
                                                <th>Precio</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {boleta.items.map((item, i) => (
                                                <tr key={i}>
                                                    <td>{item.descripcion}</td>
                                                    <td>{item.cantidad}</td>
                                                    <td>{item.precio}</td>
                                                    <td>{item.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className={styles2.totalsBox}>
                                        <div className={styles2.totalRow}>
                                            <span>Sub Total</span>
                                            <span>S/ {boleta.subtotal}</span>
                                        </div>
                                        <div className={styles2.totalRowMain}>
                                            <span>TOTAL A PAGAR</span>
                                            <span>S/ {boleta.total}</span>
                                        </div>
                                    </div>

                                    <div className={styles2.sonTexto}>
                                        <span className="material-symbols-outlined">translate</span>
                                        <span>Son: {numeroALetras(boleta.total)}</span>
                                    </div>

                                    <button
                                        className={styles2.btnDescargar}
                                        onClick={() => generarBoletaPDF(boleta)}
                                    >
                                        <span className="material-symbols-outlined">download</span>
                                        Descargar boleta PDF
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
