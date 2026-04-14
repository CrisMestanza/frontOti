import { useEffect, useState } from 'react';
import styles from '../dashboard/Dashboard.module.css';
import styles1 from './Becas.module.css';
import Swal from 'sweetalert2';
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
    fetch('http://192.168.160.168:8080/api/getPeriodo/')
      .then(res => res.json())
      .then(res => setPeriodos(Array.isArray(res) ? res : []))
      .catch(err => console.error(err));
  }, []);

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (dni && dni.length > 0 && dni.length < 8) return;

        let url = 'http://192.168.160.168:8080/api/comedor/';

        if (dni && dni.length >= 8 && !periodo) {
          url = `http://192.168.160.168:8080/api/getStudentsDni/${dni}/`;
        } else if (dni && periodo) {
          url = `http://192.168.160.168:8080/api/getStudentsPeriodoDni/${dni}/${periodo}/`;
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

  const convertirARomano = (periodo) => {
    if (!periodo) return '';

    periodo = String(periodo);

    const mapa = {
      '1': 'I',
      '2': 'II'
    };

    const partes = periodo.split('-');
    if (partes.length !== 2) return periodo;

    return `${partes[0]}-${mapa[partes[1]] || partes[1]}`;
  };
const enviarDatos = async (item) => {
  const dni = item.entidad_estudiante?.dni;
  const periodo = convertirARomano(item.entidad_periodo?.nombre);
  const programa = item.entidad_bienestar?.programa || '';
  let sede = item.entidad_estudiante?.sede || '';

  if (sede.toLowerCase().includes('sede morales')) {
    sede = 'TARAPOTO';
  } else {
    sede = sede.replace(/filial\s*/i, '').trim().toUpperCase();
  }

  let beca = '';
  const progLower = programa.toLowerCase();

  if (/semi[-\s]?beca/.test(progLower)) {
    beca = 'SEMI-BECA';
  } else if (/beca/.test(progLower)) {
    beca = 'BECA';
  }

  const body = { dni, periodo, sede, beca };

  try {
    const res = await fetch('http://192.168.160.168:8080/api/cambioBeca/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data?.mensaje === "Los datos ya fueron actualizados") {
      Swal.fire({
        icon: 'info',
        title: 'Ya actualizado',
        text: data.mensaje,
        confirmButtonColor: '#16a34a'
      });
    } else if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Correos enviados correctamente',
        confirmButtonColor: '#16a34a'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data?.mensaje || 'Ocurrió un error',
        confirmButtonColor: '#dc2626'
      });
    }

  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error de conexión',
      text: 'No se pudo enviar la información',
      confirmButtonColor: '#dc2626'
    });
  }
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

                      const programa = prog?.programa?.toLowerCase() || '';
                      const esSemi = /semi[-\s]?beca/.test(programa);
                      const esBeca = /beca/.test(programa);

                      return (
                        <tr key={i}>
                          <td>{est?.dni}</td>
                          <td>{est?.nombre_completo}</td>
                          <td>{est?.ciclo_estudiante}</td>
                          <td>{convertirARomano(per?.nombre)}</td>
                          <td>{prog?.programa}</td>

                          <td className={styles1.actions}>
                            {!esSemi && !esBeca ? (
                              <span className={styles1.noComedor}>
                                No es comedor
                              </span>
                            ) : (
                              <button
                                className={`${styles1.btnAction} ${
                                  esSemi ? styles1.btnBeca : styles1.btnSemiBeca
                                }`}
                                onClick={() => enviarDatos(item)}
                              >
                                {esSemi ? 'Cambiar a BECA' : 'Cambiar a SEMI-BECA'}
                              </button>
                            )}
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
  );
}