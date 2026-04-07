import styles from '../pages/dashboard/Dashboard.module.css';
import { Link, useLocation } from "react-router-dom";

export default function SideNav() {

    const location = useLocation();

    const links = [
        { icon: 'dashboard', label: 'Dashboard', url: '/dashboard' },
        { icon: 'mail', label: 'Gmail', url: '/gmail' },
        { icon: 'school', label: 'Courses', url: '/courses' },
        { icon: 'person', label: 'Profile', url: '/profile' },
        { icon: 'newspaper', label: 'News', url: '/news' },
    ];

    return (
        <aside className={styles.sideNav}>
            {/* Header */}
            <div className={styles.sideNavLabel}>
                <p className={styles.sideNavTitle}>Academic Portal</p>
                <p className={styles.sideNavSubtitle}>Digital Curator</p>
            </div>

            {/* Links */}
            <nav className={styles.sideNavLinks}>
                {links.map(({ icon, label, url }) => {
                    const isActive = location.pathname === url;

                    return (
                        <Link
                            key={label}
                            to={url}
                            className={isActive ? styles.sideNavLinkActive : styles.sideNavLink}
                        >
                            <span className="material-symbols-outlined">{icon}</span>
                            <span>{label}</span>
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