// Dashboard.jsx
// Uso: importa y úsalo como elemento de ruta en tu router
// Ej: <Route path="/dashboard" element={<Dashboard />} />

import styles from './Dashboard.module.css';
import SideNav from '../../components/SideNav';
import TopNav from '../../components/TopNav';
// ─── Sub-components ────────────────────────────────────────────────────────────



function WelcomeBanner() {
  const fechaEnLetras = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  return (
    <section className={styles.banner}>
      <div className={styles.bannerContent}>
        <span className={styles.bannerTag}>{fechaEnLetras}</span>
        <h1 className={styles.bannerTitle}>Bienvendo colega </h1>
        <p className={styles.bannerDesc}>
  
  Bienvenido al portal académico. Aquí podrás gestionar y supervisar tus actividades diarias.

        </p>
      </div>
      <div className={styles.bannerDecor} />
    </section>
  );
}





function MobileNav() {
  const items = [
    { icon: 'dashboard',     label: 'Home',    active: true  },
    { icon: 'school',        label: 'Courses', active: false },
    { icon: 'notifications', label: 'Alerts',  active: false },
    { icon: 'person',        label: 'Profile', active: false },
  ];

  return (
    <nav className={styles.mobileNav}>
      {items.map(({ icon, label, active }) => (
        <button
          key={label}
          className={`${styles.mobileNavBtn} ${active ? styles.active : styles.inactive}`}
        >
          <span className="material-symbols-outlined">{icon}</span>
          <span className={styles.mobileNavLabel}>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Page Component (default export → úsalo como ruta) ─────────────────────────

export default function Dashboard() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div className={styles.wrapper}>
        <TopNav />
        <SideNav />

        <main className={styles.main}>
          <div className={styles.contentInner}>
            <WelcomeBanner />

            

          
          </div>
        </main>

        <MobileNav />
      </div>
    </>
  );
}