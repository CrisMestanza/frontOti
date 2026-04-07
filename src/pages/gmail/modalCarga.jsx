import styles from "./LoadingModal.module.css";

export default function LoadingModal({ show, message }) {
    if (!show) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <div className={styles.spinner}></div>
                <p>{message || "Procesando..."}</p>
            </div>
        </div>
    );
}