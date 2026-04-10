import styles from '../dashboard/Dashboard.module.css';
import SideNav from '../../components/SideNav';
import styles2 from "./Gmail.module.css";
import { useState } from "react";
import axios from "axios";
import LoadingModal from "./modalCarga";
import TopNav from '../../components/TopNav';
// ─── Sub-components ────────────────────────────────────────────────────────────

// sidebar de arriba

// fin de sidebar de arriba


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

// ─── Page Component (default export → úsalo como ruta) ─────────────────────────

export default function Gmail() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage("");
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Selecciona un archivo primero");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            setMessage("Procesando envíos");

            await axios.post(
                "http://127.0.0.1:8000/api/gmail/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setMessage("Todo hecho ✅");
        } catch (error) {
            setMessage("Error al enviar el archivo ❌");
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            {/* Google Fonts (si tu proyecto no los carga globalmente) */}
            <link
                href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap"
                rel="stylesheet"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                rel="stylesheet"
            />

            <div className={styles.wrapper}>
                <TopNav />
                <SideNav />

                <main className={styles.main}>
                    <div className={styles.contentInner}>

                        <div className={styles2.uploadContainer}>
                            <h2 className={styles2.title}>Cargar archivo Excel</h2>

                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className={styles2.input}
                            />

                            <button onClick={handleUpload} className={styles2.button}>
                                Enviar
                            </button>

                            {loading && <div className="spinner"></div>}
                            <p>{message}</p>
                            {message && <p className={styles2.message}>{message}</p>}

                        </div>

                    </div>
                </main>

                <MobileNav />
            </div>
            <LoadingModal show={loading} message={message} />
        </>

    );
}
