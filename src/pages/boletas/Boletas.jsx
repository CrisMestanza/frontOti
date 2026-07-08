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

function generarBoletaPDF(boleta) {
    const anchoTicket = 80;
    const margenX = 5;
    const margenDer = anchoTicket - 5;
    const lineaItem = 8;
    const altoBase = 110;
    const alto = altoBase + boleta.items.length * lineaItem;

    const doc = new jsPDF({ unit: "mm", format: [anchoTicket, alto] });
    const centro = anchoTicket / 2;
    let y = 8;

    const linea = (texto, opts = {}) => {
        doc.text(String(texto ?? ""), opts.x ?? centro, y, { align: opts.align ?? "center" });
        y += opts.salto ?? 4;
    };

    const trazo = (doble = false) => {
        doc.setLineWidth(0.15);
        doc.line(margenX, y, margenDer, y);
        if (doble) {
            y += 0.8;
            doc.line(margenX, y, margenDer, y);
        }
        y += 4;
    };

    const punteado = () => {
        doc.setLineDashPattern([0.8, 0.8], 0);
        doc.line(margenX, y, margenDer, y);
        doc.setLineDashPattern([], 0);
        y += 4;
    };

    // ── ENCABEZADO INSTITUCIONAL (estático) ──
    doc.setFont("courier", "bold");
    doc.setFontSize(9.5);
    linea(ENCABEZADO[0]);

    doc.setFont("courier", "normal");
    doc.setFontSize(7.3);
    ENCABEZADO.slice(1).forEach((texto) => linea(texto, { salto: 3.6 }));

    y += 1.5;
    trazo(true);

    doc.setFont("courier", "bold");
    doc.setFontSize(8.5);
    linea("TESORERÍA - CAJA", { salto: 6 });

    doc.setFontSize(9.5);
    linea("RECIBO DE PAGO");
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    linea(boleta.recibo, { salto: 6 });

    // ── DATOS DEL CLIENTE ──
    doc.setFontSize(8);
    const campo = (label, value) => {
        doc.setFont("courier", "bold");
        doc.text(label, margenX, y);
        doc.setFont("courier", "normal");
        doc.text(String(value ?? ""), margenX + 24, y);
        y += 4.3;
    };

    campo("Cliente", boleta.cliente);
    campo("Doc. Ident.", ""); // No se muestra el documento en la boleta
    campo("Direc.", boleta.direccion);
    campo("Fecha Emis.", boleta.fecha);
    campo("Hora", boleta.hora);
    campo("Moneda", "Soles");
    y += 1;

    punteado();

    // ── DETALLE DE ITEMS ──
    doc.setFont("courier", "bold");
    doc.setFontSize(7.8);
    doc.text("Cant Und", margenX, y);
    doc.text("Precio", margenDer - 22, y, { align: "right" });
    doc.text("Total", margenDer, y, { align: "right" });
    y += 3;
    punteado();

    doc.setFont("courier", "normal");
    boleta.items.forEach((item) => {
        doc.setFontSize(7.8);
        const desc = doc.splitTextToSize(String(item.descripcion ?? ""), anchoTicket - margenX * 2);
        doc.text(desc, margenX, y);
        y += desc.length * 3.4 + 0.6;

        doc.setFontSize(8);
        doc.text(`${item.cantidad ?? ""} ${item.unidad ?? ""}`, margenX, y);
        doc.text(String(item.precio ?? ""), margenDer - 22, y, { align: "right" });
        doc.text(String(item.total ?? ""), margenDer, y, { align: "right" });
        y += 4.6;
    });

    punteado();

    // ── TOTALES ──
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.text("Sub.Total", margenX, y);
    doc.text(String(boleta.subtotal ?? ""), margenDer, y, { align: "right" });
    y += 5;

    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.text("TOTAL S/", margenX, y);
    doc.text(String(boleta.total ?? ""), margenDer, y, { align: "right" });
    y += 6;

    trazo();

    // ── MONTO EN LETRAS ──
    doc.setFont("courier", "italic");
    doc.setFontSize(7.5);
    const sonTexto = `Son: ${numeroALetras(boleta.total)}`;
    const lineasSon = doc.splitTextToSize(sonTexto, anchoTicket - margenX * 2);
    doc.text(lineasSon, margenX, y);
    y += lineasSon.length * 3.4 + 5;

    // ── PIE ──
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.text(String(boleta.efectivo ?? ""), margenX, y);
    y += 4.6;
    doc.text(`Usuario: ${boleta.usuario ?? ""}`, margenX, y);
    y += 7;

    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    linea("¡Gracias por su pago!", { x: centro, salto: 4 });

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
