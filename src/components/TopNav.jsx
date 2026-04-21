import styles from './Components.module.css';
import { useLocation } from "react-router-dom";

export default function TopNav() {
  const location = useLocation();

  return (
    <nav className={styles.topNav}>
      <div className={styles.topNavInner}>

        {/* LEFT - BRAND */}
        <div className={styles.brandBlock}>
          <img
            src="src/assets/logo.png"
            alt="UNSM"
            className={styles.logoBig}
          />

          <div className={styles.brandText}>
            <span className={styles.uniTitle}>
              Universidad Nacional de San Martín
            </span>
            <span className={styles.uniSubtitle}>
              Sistema Académico
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>

          <div className={styles.search}>
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Buscar..." />
          </div>

          <button className={styles.iconBtn}>
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <button className={styles.iconBtn}>
            <span className="material-symbols-outlined">settings</span>
          </button>

          <div className={styles.avatar}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbkZ6AKnZBP8dM_MRyXY-BhReIl9-X2ip9Bw74ehlvD8-FpcEkiqVRL5Cc3ykUweQ_EsmKpgr4sYPBm8_gtd9ZdMoXbpEhdrdljXnxrJMKO6lXppIFtR6va7lAySyA05_yEuvRE_3U0ssPo_-5bYiyf_E--Tu4M57u6GJCuTseIk0Bjn_I_nV8piVNUsz3cSWI7GXtCXM8upwUunfn-Z8vAseglWhYpDX6dcYJ5qfQ7LVhe2L1gTO-iZ0-WlJjev5gQo_5BdHpirI" />
          </div>

        </div>
      </div>
    </nav>
  );
}