import { useEffect, useState } from 'react';
import styles from '../dashboard/Dashboard.module.css';
import styles1 from './Becas.module.css';
import Swal from 'sweetalert2';
import SideNav from '../../components/SideNav';
import TopNav from '../../components/TopNav';
import MobileNav from '../../components/MobileNav';
import { API } from '../../conf/api';
export default function BecasComedor() {

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [ciclo, setCiclo] = useState('');
  const [periodo, setPeriodo] = useState('');

  const [tab, setTab] = useState("manual");

  useEffect(() => {
    fetch(API.getPeriodo)
      .then(res => res.json())
      .then(res => setPeriodos(Array.isArray(res) ? res : []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (dni && dni.length > 0 && dni.length < 8) return;

        let url = API.comedor;

        if (dni && dni.length >= 8 && !periodo) {
          url = API.studentsDni(dni);
        } else if (dni && periodo) {
          url = API.studentsPeriodoDni(dni, periodo);
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

    const mapa = { '1': 'I', '2': 'II' };

    const partes = periodo.split('-');
    if (partes.length !== 2) return periodo;

    return `${partes[0]}-${mapa[partes[1]] || partes[1]}`;
  };

  // ✅ REUTILIZABLE SWEET ALERT
  const confirmarAccion = async (titulo, texto) => {
    const result = await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    });

    return result.isConfirmed;
  };

  const cambiarEstado = async (item) => {

    const ok = await confirmarAccion(
      '¿Está seguro?',
      '¿Desea realizar esta acción?'
    );

    if (!ok) return;

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

    let estadoTexto = 'pendiente';

    if (item.entidad_estudiante?.estado === 0) {
      estadoTexto = 'aprobado';
    } else if (
      item.entidad_estudiante?.estado === 1 ||
      item.entidad_estudiante?.estado === 2
    ) {
      estadoTexto = 'pendiente';
    }

    const body = { dni, periodo, sede, beca, estado: estadoTexto };

    try {
      const res = await fetch(API.cambioEstado, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text: `Nuevo estado: ${estadoTexto}`,
          confirmButtonColor: '#16a34a'
        }).then(() => window.location.reload());

      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data?.mensaje || 'Error al actualizar',
          confirmButtonColor: '#dc2626'
        });
      }

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión'
      });
    }
  };

  const enviarDatos = async (item) => {

    const ok = await confirmarAccion(
      '¿Está seguro?',
      '¿Desea cambiar el tipo de beca?'
    );

    if (!ok) return;

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
      const res = await fetch(API.cambioBeca, {
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
        }).then(() => window.location.reload());

      } else if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Correos enviados correctamente',
          confirmButtonColor: '#16a34a'
        }).then(() => window.location.reload());

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

        {/* HEADER */}
        <div className={styles1.header}>
          <div className={styles1.headerLeft}>
            <div className={styles1.headerIcon}>
              <span className="material-symbols-outlined">mail</span>
            </div>

            <div>
              <h1 className={styles1.headerTitle}>Centro de Becas</h1>
              <p className={styles1.headerSubtitle}>
                Gestión de comedor, becas y estados
              </p>
            </div>
          </div>

          
        </div>

        {/* FILTROS */}
        <div className={styles1.filtersCard}>
          <div className={styles1.filters}>
            <input placeholder="🔎 DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
            <input placeholder="👤 Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input type="number" placeholder="📚 Ciclo" value={ciclo} onChange={(e) => setCiclo(e.target.value)} />

            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="">📅 Todos los periodos</option>
              {periodos.map((p, i) => (
                <option key={i} value={p.label}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLA */}
        <div className={styles1.tableCard}>
          <table className={styles1.table}>
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Ciclo</th>
                <th>Periodo</th>
                <th>Estado</th>
                <th>Programa</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles1.noData}>
                    No hay registros disponibles
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

                      {/* ESTADO */}
                      <td>
                        <span className={`${styles1.badge} ${
                          est?.estado === 0
                            ? styles1.pendiente
                            : est?.estado === 1
                            ? styles1.aprobado
                            : styles1.denegado
                        }`}>
                          {est?.estado === 0
                            ? 'Pendiente'
                            : est?.estado === 1
                            ? 'Aprobado'
                            : 'Denegado'}
                        </span>
                      </td>

                      <td>{prog?.programa}</td>

                      {/* ACCIONES */}
                      <td className={styles1.actions}>
                        {!esSemi && !esBeca ? (
                          <span className={styles1.noComedor}>
                            No aplica
                          </span>
                        ) : (
                          <button
                            className={`${styles1.btn} ${styles1.primary}`}
                            onClick={() => enviarDatos(item)}
                          >
                            Cambiar beca
                          </button>
                        )}

                        <button
                          className={`${styles1.btn} ${styles1.secondary}`}
                          onClick={() => cambiarEstado(item)}
                        >
                          Cambiar estado
                        </button>
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