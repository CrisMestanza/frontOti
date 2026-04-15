import styles from './Components.module.css';
import { Link, useLocation } from "react-router-dom";

export default function SideNav() {

    const location = useLocation();

const links = [
    { icon: 'dashboard', label: 'Dashboard', url: '/dashboard' },
    { icon: 'mail', label: 'Gmail', url: '/gmail' },
    { icon: 'school', label: 'Courses', url: '#' },
    { icon: 'person', label: 'Profile', url: '#' },
    { icon: 'workspace_premium', label: 'Becas', url: '/comedor' },
    { icon: 'bar_chart', label: 'Reportes', url: '/reportes' },    { icon: 'newspaper', label: 'News', url: '/#' },

];

    return (
        <aside className={styles.sideNav}>

            {/* Header */}
            <div className={styles.sideNavHeader}>
                <div className={styles.logoBox}>
                    <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                    <p className={styles.sideNavTitle}>Academic</p>
                    <p className={styles.sideNavSubtitle}>Portal</p>
                </div>
            </div>

            {/* Links */}
            <nav className={styles.sideNavLinks}>
                {links.map(({ icon, label, url }) => {
                    const isActive = location.pathname === url;

                    return (
                        <Link
                            key={label}
                            to={url}
                            className={`${styles.sideNavLink} ${isActive ? styles.active : ''}`}
                        >
                            <span className={`${styles.icon} material-symbols-outlined`}>
                                {icon}
                            </span>
                            <span className={styles.linkText}>{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className={styles.sideNavBottom}>
                <Link to="/help" className={styles.sideNavLink}>
                    <span className="material-symbols-outlined">help</span>
                    <span>Help</span>
                </Link>

                <Link to="/logout" className={styles.sideNavLink}>
                    <span className="material-symbols-outlined">logout</span>
                    <span>Logout</span>
                </Link>
            </div>

        </aside>
    );
}