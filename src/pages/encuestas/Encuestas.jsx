import styles from '../dashboard/Dashboard.module.css';
import styles2 from './Encuesta.module.css';

import SideNav from '../../components/SideNav';
import TopNav from '../../components/TopNav';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState, useEffect } from "react";
import axios from "axios";
import logoUNSM from "../../assets/logo.png";

import Swal from 'sweetalert2';

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API } from '../../conf/api';
// 🔹 MAIN COMPONENT
export default function Encuestas() {

    const [encuestas, setEncuestas] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);

    const [dniDocente, setDniDocente] = useState("");
    const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");

    // 🔹 PAGINACIÓN
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 10;

    // 🔹 TODAS LAS ENCUESTAS
    const fetchEncuestas = async () => {

        try {

            Swal.fire({
                title: 'Cargando encuestas...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

      const res = await axios.get(
    API.getEncuestas
); 

            setEncuestas(res.data);

            Swal.close();

        } catch (error) {

            Swal.close();

            Swal.fire(
                'Error',
                'No se pudo cargar las encuestas',
                'error'
            );
        }
    };

const generarPDFGeneral = async () => {

    try {

        Swal.fire({
            title: 'Generando PDF...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const res = await axios.get(API.getEncuestas);
        const data = res.data;

        if (!data || data.length === 0) {
            Swal.close();
            return Swal.fire(
                'Aviso',
                'No hay encuestas disponibles',
                'warning'
            );
        }

        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        let y = 12;

        // =========================
        // RECORRER ENCUESTAS
        // =========================
        for (let i = 0; i < data.length; i++) {

            const encuesta = data[i];

            if (i > 0) {
                doc.addPage();
                y = 12;
            }

            // =========================
            // LOGO
            // =========================
            doc.addImage(logoUNSM, "PNG", 10, 6, 25, 30);

            // =========================
            // TITULOS
            // =========================
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(90);

            doc.text(
                "UNIVERSIDAD NACIONAL DE SAN MARTÍN",
                pageWidth / 2,
                15,
                { align: "center" }
            );

            doc.line(pageWidth / 2 - 42, 16, pageWidth / 2 + 42, 16);

            doc.setFontSize(11);
            doc.text(
                "VICERRECTORADO ACADÉMICO",
                pageWidth / 2,
                21,
                { align: "center" }
            );

            doc.line(pageWidth / 2 - 28, 22, pageWidth / 2 + 28, 22);

            doc.setFontSize(9);
            doc.text(
                "DIRECCIÓN DE ASUNTOS ACADÉMICOS",
                pageWidth / 2,
                27,
                { align: "center" }
            );

            doc.line(pageWidth / 2 - 32, 28, pageWidth / 2 + 32, 28);

            // =========================
            // FECHA
            // =========================
            const fecha = new Date();

            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("OBTENIDO", 175, 14);

            doc.setFont("helvetica", "normal");
            doc.text(fecha.toLocaleDateString(), 176, 20);
            doc.text(fecha.toLocaleTimeString(), 176, 25);

            // =========================
            // LINEA
            // =========================
            doc.setDrawColor(80, 120, 70);
            doc.setLineWidth(0.5);
            doc.line(10, 38, 200, 38);

            y = 48;

            // =========================
            // DATOS
            // =========================
            doc.setFontSize(9);
            doc.setTextColor(0);

            doc.setFont("helvetica", "bold");
            doc.text("Encuesta", 20, y);
            doc.text(":", 75, y);

            doc.setFont("helvetica", "normal");
            doc.text(encuesta.nombre_encuesta || "-", 78, y);

            y += 6;

            doc.setFont("helvetica", "bold");
            doc.text("Departamento Académico", 20, y);
            doc.text(":", 75, y);

            doc.setFont("helvetica", "normal");
            doc.text(encuesta.departamento_academico || "-", 78, y);

            y += 6;

            doc.setFont("helvetica", "bold");
            doc.text("Docente", 20, y);
            doc.text(":", 75, y);

            doc.setFont("helvetica", "normal");
            doc.text(encuesta.FullName || "-", 78, y);

            y += 12;

            doc.setFontSize(8);
            doc.text("Detalle de los resultados:", 20, y);
            y += 5;

            // =========================
            // TABLAS
            // =========================
            encuesta.categorias?.forEach((categoria) => {

                const tituloCategoria =
                    categoria.amarrillo?.split(":")[0]?.trim();

                doc.setFillColor(220, 220, 220);
                doc.rect(20, y, 165, 7, "F");
                doc.setDrawColor(0);
                doc.rect(20, y, 165, 7);

                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.text(`Sección: ${tituloCategoria}`, 23, y + 4.5);

                y += 7;

                autoTable(doc, {
                    startY: y,
                    margin: { left: 20 },
                    tableWidth: 165,
                    body: categoria.preguntas?.map((p, index) => [
                        `${index + 1}. ${p.pregunta}`,
                        p.Puntuacion
                    ]) || [],
                    theme: "grid",
                    styles: {
                        fontSize: 7,
                        cellPadding: 2,
                        lineColor: [0, 0, 0],
                        lineWidth: 0.2
                    },
                    columnStyles: {
                        0: { cellWidth: 140 },
                        1: { halign: "center", cellWidth: 25, fontStyle: "bold" }
                    }
                });

                y = doc.lastAutoTable.finalY;
            });

            y += 2;

            autoTable(doc, {
                startY: y,
                margin: { left: 20 },
                tableWidth: 165,
                body: [[
                    {
                        content: "TOTAL",
                        styles: { fontStyle: "bold", halign: "right" }
                    },
                    {
                        content: String(encuesta.puntaje_total),
                        styles: { fontStyle: "bold", halign: "center" }
                    }
                ]],
                theme: "grid",
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.2
                },
                columnStyles: {
                    0: { cellWidth: 140 },
                    1: { cellWidth: 25 }
                }
            });

            y = doc.lastAutoTable.finalY + 12;

            // =========================
            // LEYENDA
            // =========================
            doc.setFontSize(6);
            doc.setFont("helvetica", "italic");

            doc.text("*Leyenda:", 20, y);
            y += 4;

            doc.text(
                "Muy de acuerdo 5; De acuerdo 4; Ni acuerdo ni desacuerdo 3; En desacuerdo 2; Muy en desacuerdo 1.",
                20,
                y,
                { maxWidth: 160 }
            );
        }

        // =========================
        // PIE DE PAGINA (NUMERACION)
        // =========================
        const totalPages = doc.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            doc.setFontSize(8);
            doc.setTextColor(120);

            doc.text(
                `Página ${i} de ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: "center" }
            );
        }

        // =========================
        // DESCARGAR
        // =========================
        doc.save("Reporte-General-Encuestas.pdf");

        Swal.close();

    } catch (error) {

        Swal.close();

        Swal.fire(
            'Error',
            'No se pudo generar el PDF',
            'error'
        );
    }
};
    // 🔹 DEPARTAMENTOS
    const fetchDepartamentos = async () => {

        try {
const res = await axios.get(
    API.getDepartamentos
);

            setDepartamentos(res.data);

        } catch (error) {

            console.log(error);

        }
    };

const buscarPorDocente = async () => {

    // 🔥 SI ESTÁ VACÍO, CARGA TODO
    if (!dniDocente) {
        fetchEncuestas(); // vuelve a traer todo
        return;
    }

    try {

        Swal.fire({
            title: 'Buscando docente...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const res = await axios.get(
            API.getEncuestaDocente(dniDocente)
        );

        const data = res.data ? [res.data] : [];

        setEncuestas(data);
        setPaginaActual(1);

        Swal.close();

    } catch (error) {

        Swal.close();

        Swal.fire(
            'Error',
            'No se encontró información',
            'error'
        );
    }
};
// ✅ PDF
// ✅ PDF
const generarPDF = async (encuesta) => {

    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    let y = 12;

    // =========================
    // LOGO LOCAL
    // =========================

    doc.addImage(
        logoUNSM,
        "PNG",
        10,
        6,
        25,
        30
    );

    // =========================
    // TITULOS
    // =========================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(90);

    doc.text(
        "UNIVERSIDAD NACIONAL DE SAN MARTÍN",
        pageWidth / 2,
        15,
        { align: "center" }
    );

    doc.line(pageWidth / 2 - 42, 16, pageWidth / 2 + 42, 16);

    doc.setFontSize(11);

    doc.text(
        "VICERRECTORADO ACADÉMICO",
        pageWidth / 2,
        21,
        { align: "center" }
    );

    doc.line(pageWidth / 2 - 28, 22, pageWidth / 2 + 28, 22);

    doc.setFontSize(9);

    doc.text(
        "DIRECCIÓN DE ASUNTOS ACADÉMICOS",
        pageWidth / 2,
        27,
        { align: "center" }
    );

    doc.line(pageWidth / 2 - 32, 28, pageWidth / 2 + 32, 28);

    // =========================
    // FECHA
    // =========================

    const fecha = new Date();

    doc.setFontSize(8);

    doc.setFont("helvetica", "bold");
    doc.text("OBTENIDO", 175, 14);

    doc.setFont("helvetica", "normal");
    doc.text(fecha.toLocaleDateString(), 176, 20);
    doc.text(fecha.toLocaleTimeString(), 176, 25);

    // =========================
    // LINEA
    // =========================

    doc.setDrawColor(80, 120, 70);
    doc.setLineWidth(0.5);
    doc.line(10, 38, 200, 38);

    y = 48;

    // =========================
    // DATOS
    // =========================

    doc.setFontSize(9);
    doc.setTextColor(0);

    doc.setFont("helvetica", "bold");
    doc.text("Encuesta", 20, y);
    doc.text(":", 75, y);

    doc.setFont("helvetica", "normal");
    doc.text(encuesta.nombre_encuesta || "-", 78, y);

    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Departamento Académico", 20, y);
    doc.text(":", 75, y);

    doc.setFont("helvetica", "normal");
    doc.text(encuesta.departamento_academico || "-", 78, y);

    y += 6;

    // CÓDIGO
    doc.setFont("helvetica", "bold");
    doc.text("Código", 20, y);
    doc.text(":", 75, y);

    doc.setFont("helvetica", "normal");
    doc.text(encuesta.UserName || "-", 78, y);

    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Docente", 20, y);
    doc.text(":", 75, y);

    doc.setFont("helvetica", "normal");
    doc.text(encuesta.FullName || "-", 78, y);

    y += 6;

    doc.setFont("helvetica", "bold");
    doc.text("Semestre", 20, y);
    doc.text(":", 75, y);

    doc.setFont("helvetica", "normal");
    doc.text("2026-I", 78, y);

    y += 12;

    doc.setFontSize(8);
    doc.text("Detalle de los resultados:", 20, y);

    y += 5;

    // =========================
    // TABLAS
    // =========================

    encuesta.categorias?.forEach((categoria) => {

        const tituloCategoria =
            categoria.amarrillo?.split(":")[0]?.trim();

        doc.setFillColor(220, 220, 220);
        doc.rect(20, y, 165, 7, "F");
        doc.setDrawColor(0);
        doc.rect(20, y, 165, 7);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        doc.text(
            `Sección: ${tituloCategoria}`,
            23,
            y + 4.5
        );

        y += 7;

        autoTable(doc, {
            startY: y,
            margin: { left: 20 },
            tableWidth: 165,
            body: categoria.preguntas?.map((p, i) => [
                `${i + 1}. ${p.pregunta}`,
                p.Puntuacion
            ]) || [],
            theme: "grid",
            styles: {
                fontSize: 7,
                cellPadding: 2,
                lineColor: [0, 0, 0],
                lineWidth: 0.2
            },
            columnStyles: {
                0: { cellWidth: 140 },
                1: { halign: "center", cellWidth: 25, fontStyle: "bold" }
            }
        });

        y = doc.lastAutoTable.finalY;
    });

    // =========================
    // PIE DE PAGINA + NUMERO
    // =========================

    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        doc.setDrawColor(180);
        doc.line(10, pageHeight - 15, 200, pageHeight - 15);

        doc.setFontSize(7);
        doc.setTextColor(120);

        doc.text(
            "Universidad Nacional de San Martín - Dirección de Asuntos Académicos",
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
        );

        doc.text(
            `Página ${i} de ${totalPages}`,
            pageWidth / 2,
            pageHeight - 6,
            { align: "center" }
        );
    }

    // =========================
    // DESCARGAR
    // =========================

    doc.save(`${encuesta.FullName}.pdf`);
};
const buscarPorDepartamento = async (id) => {

    if (!id) {
        fetchEncuestas();
        return;
    }
    try {

        Swal.fire({
            title: 'Filtrando departamento...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        const res = await axios.get(
            API.getEncuestaDepartamento(id)
        );

        // ✅ SI EL BACKEND DEVUELVE MENSAJE
        if (res.data.mensaje) {

            Swal.close();

            setEncuestas([]);

            return Swal.fire(
                'Sin resultados',
                res.data.mensaje,
                'info'
            );
        }

        // ✅ SI TODO SALE BIEN
        setEncuestas(res.data);

        setPaginaActual(1);

        Swal.close();

    } catch (error) {

        Swal.close();

        // ✅ CAPTURAR MENSAJE DEL BACKEND
        const mensaje =
            error?.response?.data?.mensaje ||
            'No se pudo filtrar';

        Swal.fire(
            'Error',
            mensaje,
            'error'
        );
    }
};

    useEffect(() => {

        fetchEncuestas();
        fetchDepartamentos();

    }, []);

    // 🔹 PAGINACIÓN
    const indexUltimo = paginaActual * registrosPorPagina;
    const indexPrimero = indexUltimo - registrosPorPagina;

    const datosActuales = encuestas.slice(
        indexPrimero,
        indexUltimo
    );

    const totalPaginas = Math.ceil(
        encuestas.length / registrosPorPagina
    );

    // 🔹 EXPORTAR EXCEL
    const exportarExcel = () => {

        if (encuestas.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(encuestas);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Encuestas"
        );

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const blob = new Blob(
            [excelBuffer],
            {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }
        );

        saveAs(blob, "encuestas.xlsx");
    };

    return (

        <div className={styles.wrapper}>

            <TopNav />
            <SideNav />

            <main className={styles.main}>

                {/* HEADER */}
                <div className={styles2.hero}>

                    <div>

                  
                        <h1 className={styles2.heroTitle}>
                            Centro de Encuestas Docentes
                        </h1>

                        <p className={styles2.heroText}>
                            Visualiza resultados, filtra docentes
                            y exporta reportes académicos.
                        </p>

                    </div>

                 <button
    onClick={generarPDFGeneral}
    className={styles2.btnExcel}
>
    <span className="material-symbols-outlined">
        picture_as_pdf
    </span>

    Exportar PDF
</button>
                </div>

                {/* FILTROS */}
                <div className={styles2.filters}>

                    <div className={styles2.filterBox}>

                        <label>
                            Buscar docente por codigo
                        </label>

                        <div className={styles2.searchGroup}>

                            <input
                                type="text"
                                placeholder="Ingrese codigo del docente"
                                value={dniDocente}
                                onChange={(e) =>
                                    setDniDocente(e.target.value)
                                }
                            />

                            <button
                                onClick={buscarPorDocente}
                            >
                                Buscar
                            </button>

                        </div>

                    </div>

                    <div className={styles2.filterBox}>

                        <label>
                            Filtrar por departamento
                        </label>

                 <select
    value={departamentoSeleccionado}
    onChange={(e) => {

        setDepartamentoSeleccionado(
            e.target.value
        );

        buscarPorDepartamento(
            e.target.value
        );
    }}
>

    <option value="">
        Todos los departamentos
    </option>

    {departamentos.map((dep, index) => (

        <option
            key={index}
            value={dep.Id}
        >
            {dep.Name?.trim()}
        </option>

    ))}

</select>

                    </div>

                </div>

                {/* TABLA */}
                <div className={styles2.card}>

                    <div className={styles2.tableContainer}>

                        <table className={styles2.table}>

                            <thead>

                                <tr>
                                    <th>Codigo</th>
                                    <th>Docente</th>
                                    <th>Departamento</th>
                                    <th>Total</th>
                                    <th>Acciones</th>

                                </tr>

                            </thead>
<tbody>

{
    datosActuales.length > 0 ? (

        datosActuales.map((encuesta, i) => (

            <tr key={i}>

                <td>

                    <div className={styles2.userBox}>


                        {encuesta.UserName}

                    </div>

                </td>

                <td>

                    <div className={styles2.docenteBox}>
                            <strong>
                                {encuesta.FullName}
                            </strong>

                    </div>

                </td>

                <td>
                    <span >
                        {encuesta.departamento_academico}
                    </span>

                </td>

                <td>

                    <span>
                        {encuesta.puntaje_total}
                    </span>

                </td>

                <td>

                    <div className={styles2.actions}>

       <button
    className={styles2.btnView}
    onClick={() => {

 Swal.fire({
    width: 620,
    showConfirmButton: false,
    showCloseButton: true,
    background: "#ffffff",
    html: `

<div class="modalDocenteV2">

    <div class="headerV2">
        <div class="iconWrap">
            <span class="material-symbols-outlined">school</span>
        </div>

        <div>
            <h2>Información del Docente</h2>
            <p>Detalle general del registro académico</p>
        </div>
    </div>

    <div class="gridInfo">

        <div class="cardInfo">
            <label>Nombre completo</label>
            <h3>${encuesta.FullName}</h3>
        </div>

        <div class="cardInfo">
            <label>DNI</label>
            <h3>${encuesta.UserName}</h3>
        </div>

        <div class="cardInfo">
            <label>Departamento</label>
            <h3>${encuesta.departamento_academico}</h3>
        </div>

        <div class="cardInfo highlight">
            <label>Puntaje total</label>
            <h3>${encuesta.puntaje_total}</h3>
        </div>

    </div>

    <div class="actions">
        <button class="btnPdf" onclick="window.descargarPdfDocente()">
            <span class="material-symbols-outlined">picture_as_pdf</span>
            Descargar PDF
        </button>
    </div>

</div>

<style>

.modalDocenteV2{
    font-family: 'Segoe UI', sans-serif;
    padding: 8px;
}

/* HEADER */
.headerV2{
    display:flex;
    align-items:center;
    gap:14px;
    margin-bottom:20px;
}

.iconWrap{
    width:52px;
    height:52px;
    border-radius:14px;
    background: linear-gradient(135deg,#065f46,#10b981);
    display:flex;
    align-items:center;
    justify-content:center;
    color:white;
}

.iconWrap span{
    font-size:28px;
}

.headerV2 h2{
    margin:0;
    font-size:20px;
    color:#111827;
}

.headerV2 p{
    margin:2px 0 0 0;
    font-size:13px;
    color:#6b7280;
}

/* GRID INFO */
.gridInfo{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap:12px;
}

.cardInfo{
    background:#f9fafb;
    border:1px solid #e5e7eb;
    border-radius:14px;
    padding:12px 14px;
    transition:.2s;
}

.cardInfo:hover{
    transform: translateY(-2px);
    border-color:#10b98133;
}

.cardInfo label{
    font-size:12px;
    color:#6b7280;
}

.cardInfo h3{
    margin:4px 0 0 0;
    font-size:15px;
    color:#111827;
    font-weight:600;
}

/* highlight score */
.highlight{
    background: linear-gradient(135deg,#ecfdf5,#ffffff);
    border:1px solid #10b98133;
}

/* ACTIONS */
.actions{
    margin-top:20px;
}

.btnPdf{
    width:100%;
    border:none;
    background: linear-gradient(135deg,#065f46,#10b981);
    color:white;
    padding:14px;
    border-radius:14px;
    font-weight:600;
    font-size:15px;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    transition:.2s;
}

.btnPdf:hover{
    transform: translateY(-2px);
    opacity:.95;
}

</style>

    `,
    didOpen: () => {
        window.descargarPdfDocente = () => {
            generarPDF(encuesta);
        };
    }
});

    }}
>

    <span className="material-symbols-outlined">
        visibility
    </span>


</button>

                    </div>

                </td>

            </tr>

        ))

    ) : (

        <tr>

            <td
                colSpan="5"
                className={styles2.noData}
            >
                No hay datos disponibles
            </td>

        </tr>

    )
}

</tbody>
                        </table>

                    </div>

                    {/* PAGINACIÓN */}
                    {totalPaginas > 1 && (

                        <div className={styles2.pagination}>

                            <button
                                disabled={paginaActual === 1}
                                onClick={() =>
                                    setPaginaActual(
                                        paginaActual - 1
                                    )
                                }
                            >
                                ◀
                            </button>

                            <span>
                                Página {paginaActual} de {totalPaginas}
                            </span>

                            <button
                                disabled={
                                    paginaActual === totalPaginas
                                }
                                onClick={() =>
                                    setPaginaActual(
                                        paginaActual + 1
                                    )
                                }
                            >
                                ▶
                            </button>

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}