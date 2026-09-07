import styles from '../dashboard/Dashboard.module.css';
import SideNav from '../../components/SideNav';
import styles2 from "./Gmail.module.css";
import { useState, useRef } from "react";
import axios from "axios";
import TopNav from '../../components/TopNav';
import Swal from 'sweetalert2';
import MobileNav from '../../components/MobileNav';
import { API } from '../../conf/api';


export default function Gmail() {

    const [tab, setTab] = useState("excel");

    // 🔸 EXCEL
    const [file, setFile] = useState(null);
    const inputRef = useRef(null);

    // 🔸 FORM CORREO
    const [form, setForm] = useState({
        correo: "",
        asunto: "",
        mensaje: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // 🔹 FILE CHANGE
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
    };

    // 🔹 CONSULTA EL PROGRESO DEL ENVÍO MASIVO HASTA QUE TERMINE
    const pollGmailProgreso = (jobId, totalInicial) => {
        return new Promise((resolve) => {
            const intervalo = setInterval(async () => {
                try {
                    const { data } = await axios.get(API.gmailProgreso(jobId));

                    const total = data.total ?? totalInicial ?? 0;
                    const procesados = data.procesados ?? 0;
                    const enviados = data.enviados ?? 0;
                    const fallidos = data.fallidos ?? [];
                    const actual = data.actual_nombre;

                    Swal.update({
                        title: 'Enviando correos...',
                        html: `
                            <div style="text-align:left">
                                <p>Procesados: <b>${procesados} / ${total}</b></p>
                                <p>Enviados: <b>${enviados}</b> &nbsp; Fallidos: <b>${fallidos.length}</b></p>
                                ${actual ? `<p style="color:#666; font-size:13px;">Actual: ${actual}</p>` : ''}
                            </div>
                        `,
                    });

                    if (data.terminado) {
                        clearInterval(intervalo);
                        Swal.close();

                        if (data.error_fatal) {
                            Swal.fire('Error', data.error_fatal, 'error');
                            resolve();
                            return;
                        }

                        if (fallidos.length === 0) {
                            Swal.fire('Éxito', `Se enviaron los ${enviados} correos correctamente`, 'success');
                        } else {
                            const listaFallidos = fallidos
                                .map(f => `<li>${f.nombre} (${f.email}) — ${f.motivo}</li>`)
                                .join('');

                            Swal.fire({
                                icon: 'warning',
                                title: 'Envío finalizado con errores',
                                html: `
                                    <p>Enviados: <b>${enviados}</b> / ${total}</p>
                                    <p>Fallaron <b>${fallidos.length}</b> correo(s):</p>
                                    <ul style="text-align:left; max-height:220px; overflow:auto; padding-left:18px;">${listaFallidos}</ul>
                                `,
                            });
                        }

                        resolve();
                    }
                } catch (error) {
                    clearInterval(intervalo);
                    Swal.close();
                    console.log(error.response?.data || error);
                    Swal.fire('Error', 'Se perdió la conexión al consultar el progreso del envío', 'error');
                    resolve();
                }
            }, 1500);
        });
    };

    // 🔹 SUBIR EXCEL
    const handleUpload = async () => {
        if (!file) {
            Swal.fire('Archivo requerido', 'Selecciona un archivo', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            Swal.fire({
                title: 'Enviando...',
                html: 'Subiendo archivo...',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await axios.post(API.gmailUpload, formData);
            const jobId = res.data.job_id;

            setFile(null);
            if (inputRef.current) inputRef.current.value = "";

            if (!jobId) {
                Swal.close();
                Swal.fire('Éxito', res.data.mensaje || 'Correos enviados', 'success');
                return;
            }

            await pollGmailProgreso(jobId, res.data.total_filas);

        } catch (error) {
            console.log(error.response?.data || error);
            Swal.close();
            Swal.fire('Error', 'Error al enviar archivo', 'error');
        }
    };
const handleSendMail = async () => {

    if (!form.correo || !form.asunto || !form.mensaje) {
        Swal.fire('Campos requeridos', 'Completa todo', 'warning');
        return;
    }

    try {
        Swal.fire({ title: 'Enviando...', didOpen: () => Swal.showLoading() });

        const res = await axios.post(API.sendMail, form); // 👈 AQUÍ ESTÁ LA CORRECCIÓN

        Swal.close();
        Swal.fire('Éxito', res.data.mensaje || 'Correo enviado correctamente', 'success');

        setForm({
            correo: "",
            asunto: "",
            mensaje: ""
        });

    } catch (error) {
        console.log(error.response?.data || error); // 👈 ver error real del backend
        Swal.close();
        Swal.fire('Error', 'No se pudo enviar el mensaje', 'error');
    }
};
    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

            <div className={styles.wrapper}>
                <TopNav />
                <SideNav />

                <main className={styles.main}>

                    {/* HEADER */}
                    <div className={styles2.header}>
                        <div className={styles2.headerLeft}>
                            <div className={styles2.headerIcon}>
                                <span className="material-symbols-outlined">mail</span>
                            </div>

                            <div>
                                <h1 className={styles2.headerTitle}>Centro de Comunicación</h1>
                                <p className={styles2.headerSubtitle}>
                                    Correos masivos y envío manual
                                </p>
                            </div>
                        </div>

                        {/* 🔥 TABS */}
                        <div className={styles2.headerActions}>
                            <button
                                onClick={() => setTab("manual")}
                                className={`${styles2.tab} ${tab === "manual" ? styles2.activeTab : ""}`}
                            >
                                Mensajes
                            </button>

                            <button
                                onClick={() => setTab("excel")}
                                className={`${styles2.tab} ${tab === "excel" ? styles2.activeTab : ""}`}
                            >
                                Carga Excel
                            </button>
                        </div>
                    </div>

                    <div className={styles.contentInner}>

                        {/* 🔥 TAB EXCEL */}
                        {tab === "excel" && (
                            <div className={styles2.uploadContainer}>
                                <div className={styles2.iconBox}>
                                    <span className="material-symbols-outlined">upload</span>
                                </div>

                                <h2 className={styles2.title}>Cargar archivo Excel</h2>

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
                                        Arrastra o haz click
                                    </span>
                                </label>

                                <button
                                    onClick={handleUpload}
                                    className={`${styles2.button} ${file ? styles2.buttonActive : ''}`}
                                    disabled={!file}
                                >
                                    Enviar Archivo
                                </button>
                            </div>
                        )}

                        {/* 🔥 TAB MANUAL */}
                        {tab === "manual" && (
                            <div className={styles2.card}>

                                <h2 className={styles2.sectionTitle}>Enviar correo</h2>

                                <div className={styles2.formGroup}>
                                    <label>Correo</label>
                                    <input
                                        type="email"
                                        name="correo"
                                        value={form.correo}
                                        onChange={handleChange}
                                        className={styles2.input}
                                    />
                                </div>

                                <div className={styles2.formGroup}>
                                    <label>Asunto</label>
                                    <input
                                        type="text"
                                        name="asunto"
                                        value={form.asunto}
                                        onChange={handleChange}
                                        className={styles2.input}
                                    />
                                </div>

                                <div className={styles2.formGroup}>
                                    <label>Mensaje</label>
                                    <textarea
                                        name="mensaje"
                                        value={form.mensaje}
                                        onChange={handleChange}
                                        className={styles2.textarea}
                                        rows="5"
                                    />
                                </div>

                                <button
                                    onClick={handleSendMail}
                                    className={styles2.buttonPrimary}
                                >
                                    Enviar Correo
                                </button>

                            </div>
                        )}

                    </div>
                </main>

                <MobileNav />
            </div>
        </>
    );
}