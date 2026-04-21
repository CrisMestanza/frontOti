import styles from './Components.module.css';
import { useLocation, useNavigate } from "react-router-dom";

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

const items = [
  { icon: 'home', label: 'Home', path: '/' },
  { icon: 'mail', label: 'Gmail', path: '/gmail' },
  { icon: 'school', label: 'Becas', path: '/becas' },
  { icon: 'payment', label: 'Pagos Comedor', path: '/comedor/pagos' },
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