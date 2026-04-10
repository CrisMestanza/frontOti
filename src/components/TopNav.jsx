// src/components/TopNav.jsx
import topNav from './Components.module.css';

export default function TopNav() {
  return (
    <nav className={topNav.topNav}>
      <div className={topNav.topNavInner}>
        <div className={topNav.topNavLeft}>
        <img src="src/assets/logo.png" alt=""  className={topNav.logo_unsm}/>

          <a href="#" className={topNav.logo}>UNSM</a>

          {/* Links visibles md+ */}
          <div className={topNav.topNavLinks}>
            <a href="#" className={topNav.topNavLinkActive}>Dashboard</a>
            <a href="#" className={topNav.topNavLink}>Courses</a>
            <a href="#" className={topNav.topNavLink}>News</a>
          </div>
        </div>

        <div className={topNav.topNavRight}>
          <div className={topNav.searchWrapper}>
            <span className={`material-symbols-outlined ${topNav.searchIcon}`}>search</span>
            <input
              type="text"
              className={topNav.searchInput}
              placeholder="Search resources..."
            />
          </div>
          <button className={topNav.iconBtn}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className={topNav.iconBtn}>
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className={topNav.avatar}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbkZ6AKnZBP8dM_MRyXY-BhReIl9-X2ip9Bw74ehlvD8-FpcEkiqVRL5Cc3ykUweQ_EsmKpgr4sYPBm8_gtd9ZdMoXbpEhdrdljXnxrJMKO6lXppIFtR6va7lAySyA05_yEuvRE_3U0ssPo_-5bYiyf_E--Tu4M57u6GJCuTseIk0Bjn_I_nV8piVNUsz3cSWI7GXtCXM8upwUunfn-Z8vAseglWhYpDX6dcYJ5qfQ7LVhe2L1gTO-iZ0-WlJjev5gQo_5BdHpirI"
              alt="Foto de perfil"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}