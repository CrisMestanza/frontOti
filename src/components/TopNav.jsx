import topNav from './Components.module.css';
import { Link, useLocation } from "react-router-dom";

export default function TopNav() {

  const location = useLocation();

  return (
    <nav className={topNav.topNav}>
      <div className={topNav.topNavInner}>

        {/* LEFT */}
        <div className={topNav.topNavLeft}>
          <img src="src/assets/logo.png" alt="" className={topNav.logo_unsm}/>

          <Link to="/dashboard" className={topNav.logo}>
            UNSM
          </Link>

          <div className={topNav.topNavLinks}>
            <Link
              to="/dashboard"
              className={location.pathname === "/dashboard" ? topNav.activeLink : topNav.topNavLink}
            >
              Dashboard
            </Link>

            <Link
              to="/courses"
              className={location.pathname === "/courses" ? topNav.activeLink : topNav.topNavLink}
            >
              Courses
            </Link>

            <Link
              to="/news"
              className={location.pathname === "/news" ? topNav.activeLink : topNav.topNavLink}
            >
              News
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className={topNav.topNavRight}>

          <div className={topNav.searchWrapper}>
            <span className={`material-symbols-outlined ${topNav.searchIcon}`}>
              search
            </span>
            <input
              type="text"
              className={topNav.searchInput}
              placeholder="Buscar..."
            />
          </div>

          <button className={topNav.iconBtn}>
            <span className="material-symbols-outlined">notifications</span>
            <span className={topNav.badge}></span>
          </button>

          <button className={topNav.iconBtn}>
            <span className="material-symbols-outlined">settings</span>
          </button>

          <div className={topNav.avatar}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbkZ6AKnZBP8dM_MRyXY-BhReIl9-X2ip9Bw74ehlvD8-FpcEkiqVRL5Cc3ykUweQ_EsmKpgr4sYPBm8_gtd9ZdMoXbpEhdrdljXnxrJMKO6lXppIFtR6va7lAySyA05_yEuvRE_3U0ssPo_-5bYiyf_E--Tu4M57u6GJCuTseIk0Bjn_I_nV8piVNUsz3cSWI7GXtCXM8upwUunfn-Z8vAseglWhYpDX6dcYJ5qfQ7LVhe2L1gTO-iZ0-WlJjev5gQo_5BdHpirI"
              alt="perfil"
            />
          </div>

        </div>

      </div>
    </nav>
  );
}