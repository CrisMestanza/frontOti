import styles from './Components.module.css';
import { Link, useLocation } from "react-router-dom";
import { getUser } from "../auth";

export default function SideNav() {
    const location = useLocation();
    const user = getUser();

    const links = [
        { icon: 'dashboard', label: 'Dashboard', url: '/dashboard', roles: ["OTI"] },
        { icon: 'mail', label: 'Gmail', url: '/gmail', roles: ["OTI"] },
        { icon: 'workspace_premium', label: 'Becas', url: '/comedor', roles: ["OTI"] },
        { icon: 'poll', label: 'Encuestas', url: '/encuestas', roles: ["OTI", "ASUNTOS_ACADEMICOS"] },
        { icon: 'bar_chart', label: 'Reportes', url: '/reportes', roles: ["OTI"] },
        { icon: 'delete', label: 'Gestionar Pagos', url: '/comedor/pagos', roles: ["OTI"] },
        { icon: 'sort', label: 'Ordenar PDF', url: '/ordenar-pdf', roles: ["OTI", "CAJA"] },
        { icon: 'receipt_long', label: 'Boletas', url: '/boletas', roles: ["OTI", "CAJA"] },
    ];

    // FILTRAR POR ROL
    let visibleLinks = links.filter(l => l.roles.includes(user?.rol));

    // 🔥 REORDENAMIENTO ESPECIAL PARA ASUNTOS_ACADEMICOS
    if (user?.rol === "ASUNTOS_ACADEMICOS") {
        visibleLinks = [
            ...visibleLinks.filter(l => l.label === "Encuestas"),
            ...visibleLinks.filter(l => l.label !== "Encuestas"),
        ];
    }

    return (
        <aside className={styles.sideNav}>

            <div className={styles.sideNavHeader}>
                <div className={styles.logoBox}>
                    <span className="material-symbols-outlined">school</span>
                </div>
                <p className={styles.sideNavTitle}>Sistema Académico</p>
            </div>

            <nav className={styles.sideNavLinks}>
                {visibleLinks.map(({ icon, label, url }) => {
                    const isActive = location.pathname === url;

                    return (
                        <Link
                            key={label}
                            to={url}
                            className={`${styles.sideNavLink} ${isActive ? styles.active : ''}`}
                        >
                            <span className="material-symbols-outlined">{icon}</span>
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.sideNavBottom}>
                <Link to="/logout" className={styles.sideNavLink}>
                    <span className="material-symbols-outlined">logout</span>
                    <span>Cerrar sesión</span>
                </Link>
            </div>

        </aside>
    );
}