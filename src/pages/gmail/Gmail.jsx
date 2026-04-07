import styles from '../dashboard/Dashboard.module.css';
import SideNav from '../../components/SideNav';
import styles2 from "./Gmail.module.css";
import { useState } from "react";
import axios from "axios";
import LoadingModal from "./modalCarga";
// ─── Sub-components ────────────────────────────────────────────────────────────

// sidebar de arriba
function TopNav() {
    <SideNav />
    return (
        <nav className={styles.topNav}>
            <div className={styles.topNavInner}>
                <div className={styles.topNavLeft}>
                    <a href="#" className={styles.logo}>UNSM Intranet</a>
                    <div className={styles.topNavLinks} style={{ display: 'none', gap: '1.5rem', marginLeft: '2rem' }}
                    // Se muestra en md+ via CSS del módulo si agregas breakpoint; aquí se oculta en móvil
                    >
                        <a href="#" className={styles.topNavLinkActive}>Dashboard</a>
                        <a href="#" className={styles.topNavLink}>Courses</a>
                        <a href="#" className={styles.topNavLink}>News</a>
                    </div>
                    {/* Links visibles solo md+ */}
                    <div className={styles.topNavLinks}>
                        <a href="#" className={styles.topNavLinkActive}>Dashboard</a>
                        <a href="#" className={styles.topNavLink}>Courses</a>
                        <a href="#" className={styles.topNavLink}>News</a>
                    </div>
                </div>

                <div className={styles.topNavRight}>
                    <div className={styles.searchWrapper}>
                        <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search resources..."
                        />
                    </div>
                    <button className={styles.iconBtn}>
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className={styles.iconBtn}>
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <div className={styles.avatar}>
                        <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbkZ6AKnZBP8dM_MRyXY-BhReIl9-X2ip9Bw74ehlvD8-FpcEkiqVRL5Cc3ykUweQ_EsmKpgr4sYPBm8_gtd9ZdMoXbpEhdrdljXnxrJMKO6lXppIFtR6va7lAySyA05_yEuvRE_3U0ssPo_-5bYiyf_E--Tu4M57u6GJCuTseIk0Bjn_I_nV8piVNUsz3cSWI7GXtCXM8upwUunfn-Z8vAseglWhYpDX6dcYJ5qfQ7LVhe2L1gTO-iZ0-WlJjev5gQo_5BdHpirI"
                            alt="Foto de perfil"
                        />
                    </div>
                </div>
            </div>
        </nav>
    );
}
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
