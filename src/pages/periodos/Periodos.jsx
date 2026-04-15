import styles from '../dashboard/Dashboard.module.css';
import SideNav from '../../components/SideNav';
import styles2 from "./Periodos.module.css";
import { useState, useEffect } from "react";
import axios from "axios";
import TopNav from '../../components/TopNav';
import Swal from 'sweetalert2';

// 🔹 MOBILE NAV
function MobileNav() {
    const items = [
        { icon: 'dashboard', label: 'Home', active: true },
        { icon: 'school', label: 'Courses', active: false },
        { icon: 'notifications', label: 'Alerts', active: false },
        { icon: 'person', label: 'Profile', active: false },
    ];

    return (
        <nav className={styles.mobileNav}>
            {items.map(({ icon, label, active }) => (
                <button
                    key={label}
                    className={`${styles.mobileNavBtn} ${active ? styles.active : styles.inactive}`}
                >
                    <span className="material-symbols-outlined">{icon}</span>
                    <span className={styles.mobileNavLabel}>{label}</span>
                </button>
            ))}
        </nav>
    );
}

// 🔹 MAIN COMPONENT
export default function Periodos() {

    const [periodos, setPeriodos] = useState([]);
    const [busqueda, setBusqueda] = useState("");

    // 🔹 Obtener datos
    const fetchPeriodos = async () => {
        try {
            Swal.fire({
                title: 'Cargando...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const res = await axios.get("http://localhost:8080/api/periodos");

            setPeriodos(res.data);

            Swal.close();
        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener los periodos'
            });
        }
    };

    useEffect(() => {
        fetchPeriodos();
    }, []);

    // 🔹 Filtrado
    const filtrados = periodos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap"
                rel="stylesheet"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                rel="stylesheet"
            />

            <div className={styles.wrapper}>
                <TopNav />
                <SideNav />

                <main className={styles.main}>
                    {/* 🔹 HEADER */}
                    <div className={styles2.header}>
                        <div className={styles2.headerLeft}>
                            <div className={styles2.headerIcon}>
                                <span className="material-symbols-outlined">calendar_month</span>
                            </div>

                            <div>
                                <h1 className={styles2.headerTitle}>Consulta de Periodos</h1>
                                <p className={styles2.headerSubtitle}>
                                    Visualiza y busca los periodos registrados.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 CONTENIDO */}
                    <div className={styles.contentInner}>

                        {/* 🔍 BUSCADOR */}
                        <div className={styles2.searchBox}>
                            <span className="material-symbols-outlined">search</span>
                            <input
                                type="text"
                                placeholder="Buscar periodo..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </div>

                        {/* 📋 TABLA */}
                        <div className={styles2.tableContainer}>
                            <table className={styles2.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Fecha Inicio</th>
                                        <th>Fecha Fin</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtrados.length > 0 ? (
                                        filtrados.map((p) => (
                                            <tr key={p.id}>
                                                <td>{p.id}</td>
                                                <td>{p.nombre}</td>
                                                <td>{p.fechaInicio}</td>
                                                <td>{p.fechaFin}</td>
                                                <td>
                                                    <span className={
                                                        p.estado === "ACTIVO"
                                                            ? styles2.badgeActive
                                                            : styles2.badgeInactive
                                                    }>
                                                        {p.estado}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className={styles2.noData}>
                                                No hay resultados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </main>

                <MobileNav />
            </div>
        </>
    );
}