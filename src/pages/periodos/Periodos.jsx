import styles from '../dashboard/Dashboard.module.css';
import SideNav from '../../components/SideNav';
import styles2 from "./Periodos.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import TopNav from '../../components/TopNav';
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

import { saveAs } from "file-saver";
// 🔹 MAIN COMPONENT
export default function Periodos() {

    const [listaPeriodos, setListaPeriodos] = useState([]);
    const [periodoSeleccionado, setPeriodoSeleccionado] = useState("");

    // 🔥 NUEVO
    const [reporte, setReporte] = useState([]);

    // 🔹 PAGINACIÓN
    const [paginaActual, setPaginaActual] = useState(1);
    const registrosPorPagina = 10;

    // 🔹 SELECT
    const fetchSelectPeriodos = async () => {
        try {
            const res = await axios.get("http://192.168.160.238:8080/api/getPeriodo");
            setListaPeriodos(res.data);
        } catch (error) {
            Swal.fire('Error', 'No se pudo cargar periodos', 'error');
        }
    };

    // 🔥 CONSUMIR REPORTE
    const fetchReporte = async (id) => {
        try {
            Swal.fire({
                title: 'Generando reporte...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const res = await axios.get(`http://192.168.160.238:8080/api/generarReportes/${id}`);
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

    // 🔥 CUANDO CAMBIA SELECT
    const handleChangePeriodo = (e) => {
        const id = e.target.value;
        setPeriodoSeleccionado(id);

        if (id) {
            fetchReporte(id);
        } else {
            setReporte([]);
        }
    };

    // 🔹 PAGINACIÓN LOGICA
    const indexUltimo = paginaActual * registrosPorPagina;
    const indexPrimero = indexUltimo - registrosPorPagina;
    const datosActuales = reporte.slice(indexPrimero, indexUltimo);
    const totalPaginas = Math.ceil(reporte.length / registrosPorPagina);

const exportarExcel = () => {
    if (reporte.length === 0) return;

    const data = reporte.map(r => ({
        // 🔹 DATOS PERSONALES
        Nombre: r.Name,
        ApellidoPaterno: r.PaternalSurname,
        ApellidoMaterno: r.MaternalSurname,
        TipoDocumento: r.DocumentType,
        Documento: r.Document,
        Codigo: r.Code,
        Sexo: r.Sexo,
        Procedencia: r.Procedencia,

        // 🔹 FECHA
        FechaNacimiento: r.FechaNacimiento
            ? new Date(r.FechaNacimiento).toLocaleDateString()
            : "",

        Edad: r.Edad,
        EstadoCivil: r.EstadoCivil,
        NumeroHijos: r.NumeroHijos,

        // 🔹 UBICACIÓN
        Pais: r.Pais,
        DepNacimiento: r.DepartamentoNacimiento,
        ProvNacimiento: r.ProvinciaNacimiento,
        DistNacimiento: r.DistritoNacimiento,

        DepResidencia: r.DepartamentoResidencia,
        ProvResidencia: r.ProvinciaResidencia,
        DistResidencia: r.DistritoResidencia,

        Direccion: r.Address,

        // 🔹 CONTACTO
        Email: r.Email,
        Telefono1: r.Phone1,
        Telefono2: r.Phone2 || "",

        // 🔹 TRABAJO
        Trabaja: r.SeEncuentraTrabajando ? "Sí" : "No",
        Ocupacion: r.Occupation || "",
        EstadoLaboral: r.EmploymentStatus || "",
        Empresa: r.Business || "",

        // 🔹 APODERADO
        FamiliarApoderado: r.FamiliarApoderado,
        NombreApoderado: r.RepresentativeName,
        RelacionApoderado: r.RepresentativeRelation,
        OcupacionApoderado: r.RepresentativeOcupation,
        CentroLaboralApoderado: r.CentroLaboral,
        TelefonoApoderado: r.RepresentativePhone,
        EmailApoderado: r.RepresentativeEmail || "",

        // 🔹 EDUCACIÓN
        TipoEducacion: r.TipoEducacion,
        EstudiosConcluidos: r.EstudiosConcluidos,
        Colegio: r.Colegio,

        DepColegio: r.DepartamentoColegio,
        ProvColegio: r.ProvinciaColegio,
        DistColegio: r.DistritoColegio,

        InicioEstudios: r.FechaInicioPeriodoEstudio,
        FinEstudios: r.FechaFinPeriodoEstudio || "",

        // 🔹 OTROS
        Discapacidad: r.PresentaDiscapacidad,
        TipoDiscapacidad: r.DiscapacityType || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    // 🔥 AUTO ANCHO DINÁMICO
    const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(
            key.length,
            ...data.map(row => (row[key] ? row[key].toString().length : 10))
        )
    }));

    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Completo");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array"
    });

    const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    saveAs(blob, "reporte_completo.xlsx");
};
    return (
        <div className={styles.wrapper}>
            <TopNav />
            <SideNav />

            <main className={styles.main}>
                <div className={styles2.header}>
                    <h1>Reportes por Periodo</h1>
                </div>

                <div className={styles.contentInner}>

                    {/* 🔥 SELECT */}
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

                    {/* 🔥 BOTÓN EXCEL */}
                    {reporte.length > 0 && (
                        <button onClick={exportarExcel} className={styles2.btnExcel}>
                            Descargar Excel
                        </button>
                    )}

                    {/* 🔥 TABLA DINÁMICA */}
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