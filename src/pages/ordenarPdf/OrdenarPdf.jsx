import { useState, useRef } from "react";
import TopNav from "../../components/TopNav";
import SideNav from "../../components/SideNav";
import MobileNav from "../../components/MobileNav";
import styles from "./OrdenarPdf.module.css";
import { API_BASE } from "../../conf/api";
import Swal from "sweetalert2";

export default function OrdenarPdf() {
    const [archivo, setArchivo] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [arrastrado, setArrastrado] = useState(false);
    const inputRef = useRef();

    const handleFile = (file) => {
        if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
            Swal.fire({
                icon: "warning",
                title: "Archivo inválido",
                text: "Solo se permiten archivos PDF.",
                confirmButtonColor: "#15803d",
            });
            return;
        }
        setArchivo(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setArrastrado(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleEnviar = async () => {
        if (!archivo) {
            Swal.fire({
                icon: "warning",
                title: "Sin archivo",
                text: "Por favor selecciona un PDF antes de continuar.",
                confirmButtonColor: "#15803d",
            });
            return;
        }

        setCargando(true);
        const formData = new FormData();
        formData.append("pdf", archivo);

        try {
            const res = await fetch(`${API_BASE}/ordenarpdf/`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Error al procesar el PDF.");
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setArchivo(null);

            await Swal.fire({
                icon: "success",
                title: "PDF ordenado con éxito",
                html: `
                    <p style="margin-bottom:20px;color:#475569">El PDF fue procesado y ordenado correctamente.</p>
                    <a href="${url}" download="caja_ordenado.pdf"
                       style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;
                              background:#15803d;color:#fff;border-radius:10px;
                              text-decoration:none;font-weight:600;font-size:0.95rem">
                        ⬇ Descargar PDF ordenado
                    </a>
                `,
                confirmButtonText: "Cerrar",
                confirmButtonColor: "#64748b",
                didClose: () => URL.revokeObjectURL(url),
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error al procesar",
                text: err.message || "Ocurrió un error inesperado. Intenta nuevamente.",
                confirmButtonColor: "#15803d",
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <TopNav />
            <SideNav />
            <main className={styles.main}>
                <div className={styles.content}>
                    <h1 className={styles.titulo}>Ordenar PDF de Caja</h1>
                    <p className={styles.subtitulo}>
                        Sube el PDF generado por el sistema de caja y recibirás las filas ordenadas
                        por número de comprobante listas para descargar.
                    </p>

                    <div
                        className={`${styles.dropzone} ${arrastrado ? styles.dropzoneActivo : ""} ${archivo ? styles.dropzoneListo : ""}`}
                        onClick={() => inputRef.current.click()}
                        onDragOver={(e) => { e.preventDefault(); setArrastrado(true); }}
                        onDragLeave={() => setArrastrado(false)}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".pdf"
                            style={{ display: "none" }}
                            onChange={(e) => handleFile(e.target.files[0])}
                        />

                        <span className="material-symbols-outlined" style={{
                            fontSize: "3.5rem",
                            color: archivo ? "#15803d" : "#94a3b8",
                            transition: "0.25s",
                        }}>
                            {archivo ? "picture_as_pdf" : "upload_file"}
                        </span>

                        {archivo ? (
                            <>
                                <p className={styles.nombreArchivo}>{archivo.name}</p>
                                <p className={styles.tamano}>{(archivo.size / 1024).toFixed(1)} KB</p>
                            </>
                        ) : (
                            <>
                                <p className={styles.dropText}>Arrastra el PDF aquí o haz clic para seleccionar</p>
                                <p className={styles.dropHint}>Solo archivos .pdf</p>
                            </>
                        )}
                    </div>

                    <div className={styles.acciones}>
                        {archivo && (
                            <button
                                className={styles.btnSecundario}
                                onClick={(e) => { e.stopPropagation(); setArchivo(null); }}
                                disabled={cargando}
                            >
                                <span className="material-symbols-outlined">close</span>
                                Quitar archivo
                            </button>
                        )}
                        <button
                            className={styles.btnPrimario}
                            onClick={handleEnviar}
                            disabled={cargando || !archivo}
                        >
                            <span className={`material-symbols-outlined ${cargando ? styles.spin : ""}`}>
                                {cargando ? "autorenew" : "sort"}
                            </span>
                            {cargando ? "Procesando..." : "Ordenar PDF"}
                        </button>
                    </div>
                </div>
            </main>
            <MobileNav />
        </>
    );
}
