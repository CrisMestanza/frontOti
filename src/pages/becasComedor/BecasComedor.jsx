import { useEffect, useState } from 'react';
import styles from '../dashboard/Dashboard.module.css';
import styles1 from './Becas.module.css';

import SideNav from '../../components/SideNav';
import TopNav from '../../components/TopNav';



// 🔹 MOBILE NAV
function MobileNav() {
  const items = [
    { icon: 'dashboard', label: 'Home', active: true },
    { icon: 'school', label: 'Courses', active: false },
    { icon: 'notifications', label: 'Alerts', active: false },
    { icon: 'person', label: 'Profile', active: false },
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

// 🔹 MAIN COMPONENT
export default function BecasComedor() {

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [ciclo, setCiclo] = useState('');
  const [periodo, setPeriodo] = useState('');
  

  // 🔥 CARGAR PERIODOS
  useEffect(() => {
    fetch('http://192.168.160.250:8000/api/getPeriodo/')
      .then(res => res.json())
      .then(res => setPeriodos(Array.isArray(res) ? res : []))
      .catch(err => console.error(err));
  }, []);

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {

        if (dni && dni.length > 0 && dni.length < 8) return;

        let url = 'http://192.168.160.250:8000/api/comedor/';

        if (dni && dni.length >= 8 && !periodo) {
          url = `http://192.168.160.250:8000/api/getStudentsDni/${dni}/`;
        } else if (dni && periodo) {
          url = `http://192.168.160.250:8000/api/getStudentsPeriodoDni/${dni}/${periodo}/`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Error API');

        const result = await res.json();
        const safeData = Array.isArray(result) ? result : [];

        setData(safeData);
        setFiltered(safeData);

      } catch (error) {
        console.error(error);
        setData([]);
        setFiltered([]);
      }
    };

    fetchData();
  }, [dni, periodo]);
const enviarDatos = (item) => {
  const dni = item.entidad_estudiante?.dni;
  const periodo = item.entidad_periodo?.nombre;
  const programa = item.entidad_bienestar?.programa || '';
  let sede = item.entidad_estudiante?.sede || '';

  // Normalizar la sede
  if (sede.toLowerCase().includes('sede morales')) {
    sede = 'Tarapoto';
  } else {
    // Eliminamos cualquier ocurrencia de la palabra "Filial" (mayúscula o minúscula)
    sede = sede.replace(/filial\s*/i, '').trim();
  }

  // Determinar tipo de beca
  let mensajeBeca = 'Este programa no pertenece a ningún tipo de beca de comedor';
  const progLower = programa.toLowerCase();

  if (/semi[-\s]?beca(s)?/.test(progLower)) {
    mensajeBeca = 'SEMI-BECAS';
  } else if (/beca(s)?/.test(progLower)) {
    mensajeBeca = 'BECA';
  }

  alert(
    "Datos a enviar:\n" +
    "DNI: " + dni + "\n" +
    "Periodo: " + periodo + "\n" +
    "Sede: " + sede + "\n" +
    "Beca: " + mensajeBeca
  );
};
const handleChangeToSemiBeca = (prog) => {
  console.log(`Cambiando estado de ${prog?.programa} a Semibeca`);
  
  prog.estado = prog.estado === 'Beca' ? 'Semibeca' : 'Beca';
  setPrograms([...programs]); // programs sería tu state de la tabla
};
  // 🔥 FILTROS
  useEffect(() => {
    let result = [...data];

    if (dni) {
      result = result.filter(item =>
        item.entidad_estudiante?.dni?.includes(dni)
      );
    }

    if (nombre) {
      result = result.filter(item =>
        item.entidad_estudiante?.nombre_completo
          ?.toLowerCase()
          .includes(nombre.toLowerCase())
      );
    }

    if (ciclo) {
      result = result.filter(item =>
        item.entidad_estudiante?.ciclo_estudiante == ciclo
      );
    }

    if (periodo) {
      result = result.filter(item =>
        item.entidad_periodo?.nombre == periodo
      );
    }

    setFiltered(result);
  }, [dni, nombre, ciclo, periodo, data]);

  return (
    <>
      <div className={styles.wrapper}>
        <TopNav />
        <SideNav />
        <MobileNav />

        <main className={styles.main}>
          <div className={styles.contentInner}>

            <div className={styles1.container}>
              <h1 className={styles1.title}>Gestion de becas</h1>

              {/* FILTROS */}
              <div className={styles1.filters}>
                <input placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
                <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                <input type="number" placeholder="Ciclo" value={ciclo} onChange={(e) => setCiclo(e.target.value)} />

                <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                  <option value="">Todos</option>
                  {periodos.map((p, i) => (
                    <option key={i} value={p.label}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* TABLA */}
        <div className={styles1.tableContainer}>
  <table className={styles1.table}>
    <thead>
      <tr>
        <th>DNI</th>
        <th>Nombre</th>
        <th>Ciclo</th>
        <th>Periodo</th>
        <th>Programa</th>
        <th>Acciones</th>
      </tr>
    </thead>

    <tbody>
      {filtered.length === 0 ? (
        <tr>
          <td colSpan="6" className={styles1.noData}>
            No hay datos registrados
          </td>
        </tr>
      ) : (
        filtered.map((item, i) => {
          const est = item.entidad_estudiante;
          const per = item.entidad_periodo;
          const prog = item.entidad_bienestar;
          const tra = item.entidad_tramite;

          return (
            <tr key={i}>
              <td>{est?.dni}</td>
              <td>{est?.nombre_completo}</td>
              <td>{est?.ciclo_estudiante}</td>
              <td>{per?.nombre}</td>
              <td>{prog?.programa}</td>
              <td className="actions">
  {/* Icono para ver información */}
  <span 
    className="material-symbols-outlined" 
    style={{ cursor: 'pointer', marginRight: '8px' }}
    title="Ver información"
    onClick={() => handleViewInfo(prog)}
  >
    info
  </span>

  {/* Icono para cambiar estado a Semibeca */}
  <span 
    className="material-symbols-outlined" 
    style={{ cursor: 'pointer', color: prog?.estado === 'Beca' ? 'orange' : 'blue' }}
    title="Cambiar estado a Semibeca"
    onClick={() => enviarDatos(item)}
  >
    swap_horiz
  </span>
</td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>

            </div>

          </div>
        </main>
      </div>
    </>
  );
}