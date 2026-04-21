
import styles from './Dashboard.module.css';
import SideNav from '../../components/SideNav';
import TopNav from '../../components/TopNav';
import MobileNav from '../../components/MobileNav';



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