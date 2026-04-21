import styles from '../dashboard/Dashboard.module.css';
import SideNav from '../../components/SideNav';
import styles2 from "./Periodos.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import TopNav from '../../components/TopNav';
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API } from '../../conf/api';
// 🔹 MAIN COMPONENT
export default function Periodos() {

    const [listaPeriodos, setListaPeriodos] = useState([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");

    // 🔥 NUEVO: segundo select
    const [terms, setTerms] = useState([]);
    const [termSeleccionado, setTermSeleccionado] = useState("");

    // 🔥 REPORTE
    const [reporte, setReporte] = useState([]);

    // 🔹 PAGINACIÓN
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 10;

    // 🔹 CARGAR PERIODOS
    const fetchSelectPeriodos = async () => {
        try {
            const res = await axios.get(API.getPeriodo);
            setListaPeriodos(res.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar periodos', 'error');
        }
    };

    // 🔹 CARGAR TERMS (cuando eliges periodo)
    const fetchTerms = async (periodoId) => {
        try {
            const res = await axios.get(
                API.getApplicationTerms(periodoId)
            );
            setTerms(res.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar procesos', 'error');
        }
    };

    // 🔥 CONSUMIR REPORTE FINAL
    const fetchReporte = async (termId) => {
        try {
            Swal.fire({
                title: 'Generando reporte...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const res = await axios.get(
                API.generarReportes(termId)
            );

            setReporte(res.data);
            setPaginaActual(1);

            Swal.close();
        } catch (error) {
            Swal.close();
            Swal.fire('Error', 'No se pudo generar el reporte', 'error');
        }
    };

    useEffect(() => {
        fetchSelectPeriodos();
    }, []);

    // 🔹 CUANDO CAMBIA PERIODO
    const handleChangePeriodo = (e) => {
        const id = e.target.value;
        setPeriodoSeleccionado(id);

        setTermSeleccionado('');
        setReporte([]);
        setTerms([]);

        if (id) {
            fetchTerms(id);
        }
    };

    // 🔹 CUANDO CAMBIA TERM (AQUÍ recién dispara reporte)
    const handleChangeTerm = (e) => {
        const id = e.target.value;
        setTermSeleccionado(id);

        if (id) {
            fetchReporte(id);
        } else {
            setReporte([]);
        }
    };

    // 🔹 PAGINACIÓN
    const indexUltimo = paginaActual * registrosPorPagina;
    const indexPrimero = indexUltimo - registrosPorPagina;
    const datosActuales = reporte.slice(indexPrimero, indexUltimo);
    const totalPaginas = Math.ceil(reporte.length / registrosPorPagina);

    // 🔹 EXPORTAR EXCEL
    const exportarExcel = () => {
        if (reporte.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(reporte);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        saveAs(blob, "reporte.xlsx");
    };

    return (
        <div className={styles.wrapper}>
            <TopNav />
            <SideNav />

            <main className={styles.main}>
            <div className={styles2.header}>

  <div className={styles2.headerLeft}>
    <div className={styles2.headerIcon}>
      <span className="material-symbols-outlined">bar_chart</span>
    </div>

    <div>
      <h1 className={styles2.headerTitle}>Centro de Reportes</h1>
      <p className={styles2.headerSubtitle}>
        Generación de reportes por periodo y procesos académicos
      </p>
    </div>
  </div>

  <div className={styles2.headerActions}>
    {reporte.length > 0 && (
      <button onClick={exportarExcel} className={styles2.btnPrimary}>
        Descargar Excel
      </button>
    )}
  </div>

</div>

                <div className={styles.contentInner}>

                    {/* 🔥 SELECT PERIODO */}
                    <select
                        value={periodoSeleccionado}
                        onChange={handleChangePeriodo}
                        className={styles2.select}
                    >
                        <option value="">-- Seleccionar Periodo --</option>
                        {listaPeriodos.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>

                    {/* 🔥 SELECT PROCESOS */}
                    {terms.length > 0 && (
                        <select
                            value={termSeleccionado}
                            onChange={handleChangeTerm}
                            className={styles2.select}
                        >
                            <option value="">-- Seleccionar Proceso --</option>

                            {terms.map((t) => (
                                <option key={t.Id} value={t.Id}>
                                    {t.Name} - {t.Periodo}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* 🔥 TABLA */}
                    <div className={styles2.tableContainer}>
                        <table className={styles2.table}>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Documento</th>
                                    <th>Sexo</th>
                                    <th>Edad</th>
                                    <th>Colegio</th>
                                    <th>Teléfono</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosActuales.length > 0 ? (
                                    datosActuales.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r.Name} {r.PaternalSurname} {r.MaternalSurname}</td>
                                            <td>{r.Document}</td>
                                            <td>{r.Sexo}</td>
                                            <td>{r.Edad}</td>
                                            <td>{r.Colegio}</td>
                                            <td>{r.Phone1}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">No hay datos</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 🔥 PAGINACIÓN */}
                    {totalPaginas > 1 && (
                        <div className={styles2.pagination}>
                            <button
                                disabled={paginaActual === 1}
                                onClick={() => setPaginaActual(paginaActual - 1)}
                            >
                                ◀
                            </button>

                            <span>Página {paginaActual} de {totalPaginas}</span>

                            <button
                                disabled={paginaActual === totalPaginas}
                                onClick={() => setPaginaActual(paginaActual + 1)}
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