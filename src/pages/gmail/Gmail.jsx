import styles from '../dashboard/Dashboard.module.css';
import SideNav from '../../components/SideNav';
import styles2 from "./Gmail.module.css";
import { useState, useRef } from "react";
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
export default function Gmail() {
    const [file, setFile] = useState(null);
    const inputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            Swal.fire({
                icon: 'warning',
                title: 'Archivo requerido',
                text: 'Selecciona un archivo primero',
                confirmButtonColor: '#16a34a'
            });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            // 🔥 SOLO UN LOADING (Swal)
            Swal.fire({
                title: 'Enviando correos...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            await axios.post(
                "http://192.168.160.238:8080/api/gmail/",
                formData
            );

            // 🔥 CERRAR LOADING
            Swal.close();

            // ✅ ÉXITO
            Swal.fire({
                icon: 'success',
                title: 'Correos enviados',
                text: 'Todos los correos fueron enviados correctamente',
                confirmButtonColor: '#16a34a'
            });

            // limpiar
            setFile(null);
            if (inputRef.current) {
                inputRef.current.value = "";
            }

        } catch (error) {

            Swal.close(); // 🔥 IMPORTANTE

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un problema al enviar el archivo',
                confirmButtonColor: '#dc2626'
            });
        }
    };

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
                    <div className={styles2.header}>
                        <div className={styles2.headerLeft}>
                            <div className={styles2.headerIcon}>
                                <span className="material-symbols-outlined">mail</span>
                            </div>

                            <div>
                                <h1 className={styles2.headerTitle}>Centro de Comunicación</h1>
                                <p className={styles2.headerSubtitle}>
                                    Gestiona tus correos institucionales y carga de datos masivos.
                                </p>
                            </div>
                        </div>

                        <div className={styles2.headerActions}>
                            <button className={styles2.tab}>Mensajes</button>
                            <button className={`${styles2.tab} ${styles2.activeTab}`}>
                                Carga Excel
                            </button>
                        </div>
                    </div>

                    <div className={styles.contentInner}>
                        <div className={styles2.uploadContainer}>

                            <div className={styles2.iconBox}>
                                <span className="material-symbols-outlined">upload</span>
                            </div>

                            <h2 className={styles2.title}>Cargar archivo Excel</h2>

                            <p className={styles2.subtitle}>
                                Sube la lista de estudiantes.
                            </p>

                            <label className={styles2.dropzone}>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    hidden
                                />

                                <span className={styles2.dropTitle}>
                                    {file ? file.name : "Seleccionar archivo"}
                                </span>

                                <span className={styles2.dropText}>
                                    o arrastra y suelta aquí
                                </span>
                            </label>

                       <button
    onClick={handleUpload}
    className={`${styles2.button} ${file ? styles2.buttonActive : ''}`}
    disabled={!file}
>
                                <span className="material-symbols-outlined">upload</span>
                                Enviar Archivo
                            </button>

                        </div>
                    </div>
                </main>

                <MobileNav />
            </div>
        </>
    );
}