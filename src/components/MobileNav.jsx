import styles from './Components.module.css';
import { useLocation, useNavigate } from "react-router-dom";
import { getUser } from "../auth";

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

const user = getUser();

const items = [
  { icon: 'home', label: 'Home', path: '/dashboard', roles: ["OTI"] },
  { icon: 'mail', label: 'Gmail', path: '/gmail', roles: ["OTI"] },
  { icon: 'school', label: 'Becas', path: '/comedor', roles: ["OTI"] },
  { icon: 'poll', label: 'Encuestas', path: '/encuestas', roles: ["OTI", "ASUNTOS_ACADEMICOS"] },
  { icon: 'payment', label: 'Pagos', path: '/comedor/pagos', roles: ["OTI"] },
];
  return (
    <nav className={styles.mobileNav}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`${styles.mobileNavBtn} ${isActive ? styles.active : ''}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className={styles.mobileNavLabel}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}