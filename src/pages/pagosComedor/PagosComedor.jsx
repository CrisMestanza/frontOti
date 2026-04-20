import { useEffect, useState } from 'react';
import styles from '../dashboard/Dashboard.module.css';
import styles2 from './PagosPendientes.module.css';
import SideNav from '../../components/SideNav';
import TopNav from '../../components/TopNav';
import Swal from 'sweetalert2';

function MobileNav() {
    const items = [
        { icon: 'dashboard', label: 'Home', active: true },
        { icon: 'school', label: 'Becas', active: false },
        { icon: 'mail', label: 'Gmail', active: false },
        { icon: 'payments', label: 'Pagos', active: false },
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

export default function PagosPendientes() {

    const [dni, setDni] = useState('');
    const [users, setUsers] = useState([]);
    const [usersOriginal, setUsersOriginal] = useState([]); // 🔥 respaldo
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [selectedDni, setSelectedDni] = useState('');

    // 🔥 CARGAR TODOS
    useEffect(() => {
        setLoading(true);

        fetch(`http://192.168.161.243:8000/api/getUser`)
            .then(res => res.json())
            .then(res => {
                setUsers(res?.data || []);
                setUsersOriginal(res?.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // 🔥 BUSCAR POR DNI (TU API)
    const buscarPorDni = () => {

        if (!dni) {
            // 🔄 si está vacío, vuelve todo
            setUsers(usersOriginal);
            return;
        }

        if (dni.length < 8) {
            Swal.fire('Error', 'Ingrese un DNI válido', 'warning');
            return;
        }

        setLoading(true);

        fetch(`http://192.168.161.243:8000/api/getestudiantedi/${dni}`)
            .then(res => res.json())
            .then(res => {

                if (!res?.data) {
                    setUsers([]);
                    Swal.fire('Sin resultados', 'No se encontró el DNI', 'info');
                } else {
                    // 🔥 convertir a array para la tabla
                    setUsers([res.data]);
                }

                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };
const eliminarPago = (id) => {

    Swal.fire({
        title: '¿Eliminar pago?',
        text: 'Esta acción no se puede revertir',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Sí, eliminar'
    }).then((result) => {

        if (result.isConfirmed) {

            fetch(`http://192.168.161.243:8000/api/deletePago/${id}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(() => {

                    // 🔥 quitar de la tabla sin recargar
                    setPagos(prev => prev.filter(p => p.Id !== id));

                    Swal.fire('Eliminado', 'Pago eliminado correctamente', 'success');
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire('Error', 'No se pudo eliminar', 'error');
                });
        }
    });
}; 
    // 🔥 PAGOS
    const obtenerPagos = (dniInput) => {
        if (!dniInput || dniInput.length < 8) {
            Swal.fire('Error', 'Ingrese un DNI válido', 'warning');
            return;
        }

        setSelectedDni(dniInput);
        setLoading(true);

        fetch(`http://192.168.161.243:8000/api/getPagos/${dniInput}`)
            .then(res => res.json())
            .then(res => {
                setPagos(res?.data || []);
                setLoading(false);
                setOpenModal(true);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    return (
        <div className={styles.wrapper}>
            <TopNav />
            <SideNav />

            <main className={styles.main}>
                <div className={styles.contentInner}>

                    <div className={styles2.header}>
                        <div className={styles2.headerLeft}>
                            <span className="material-symbols-outlined">people</span>

                            <div>
                                <h1 className={styles2.headerTitle}>Usuarios</h1>
                                <p className={styles2.headerSubtitle}>
                                    Busca o visualiza pagos por DNI
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 🔎 BUSCADOR */}
                    <div className={styles2.searchBox}>
                        <input
                            placeholder="Buscar DNI..."
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                        />

                        <button onClick={buscarPorDni}>
                            Buscar
                        </button>
                    </div>

                    <div className={styles2.tableContainer}>
                        <table className={styles2.table}>

                            <thead>
                                <tr>
                                    <th>DNI</th>
                                    <th>Nombre</th>
                                    <th>Apellidos</th>
                                    <th>Correo</th>
                                    <th>Teléfono</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6}>Cargando...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={6}>Sin datos</td></tr>
                                ) : (
                                    users.map((item) => (
                                        <tr key={item.Id}>
                                            <td>{item.Dni}</td>
                                            <td>{item.Name || item.FullName}</td>
                                            <td>{item.PaternalSurname} {item.MaternalSurname}</td>
                                            <td>{item.Email || '---'}</td>
                                            <td>{item.PhoneNumber || '---'}</td>

                                            <td>
                                                <button
                                                    onClick={() => obtenerPagos(item.Dni)}
                                                    style={{
                                                        background: '#1976d2',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '6px 10px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Ver pagos
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>

                </div>
            </main>

            <MobileNav />

     {/* 🪟 MODAL */}
{openModal && (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
    }}>
        <div style={{
            background: 'white',
            width: '95%',
            maxWidth: '900px',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>

            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Pagos del DNI: {selectedDni}</h3>

                <button onClick={() => setOpenModal(false)}
                    style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}>
                    X
                </button>
            </div>

            <hr style={{ margin: '15px 0' }} />

            {loading ? (
                <p>Cargando pagos...</p>
            ) : pagos.length === 0 ? (
                <p>No hay pagos</p>
            ) : (
                <div style={{
                    overflowX: 'auto',
                    borderRadius: '12px'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                    }}>

                        <thead>
                            <tr style={{
                                background: 'linear-gradient(135deg, #065f46, #10b981)',
                                color: 'white'
                            }}>
                                <th style={{ padding: '12px' }}>Descripción</th>
                                <th style={{ padding: '12px' }}>Total</th>
                                <th style={{ padding: '12px' }}>Estado</th>
                                <th style={{ padding: '12px' }}>Fecha</th>
                                <th style={{ padding: '12px' }}>Acción</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pagos.map((p) => (
                                <tr key={p.Id} style={{
                                    borderBottom: '1px solid #ecfdf5',
                                    transition: '0.2s'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >

                                    <td style={{ padding: '10px' }}>{p.Description}</td>

                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>
                                        S/ {p.Total}
                                    </td>

                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '5px 10px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background:
                                                p.Status === 'Pagado'
                                                    ? '#dcfce7'
                                                    : '#fef3c7',
                                            color:
                                                p.Status === 'Pagado'
                                                    ? '#166534'
                                                    : '#92400e'
                                        }}>
                                            {p.Status}
                                        </span>
                                    </td>

                                    <td style={{ padding: '10px' }}>
                                        {p.CreatedAt?.split('T')[0]}
                                    </td>

                                    {/* 🗑 ELIMINAR */}
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => eliminarPago(p.Id)}
                                            style={{
                                                background: 'transparent',
                                                color: 'red',
                                                border: 'none',
                                                padding: '6px 10px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                                delete
                                            </span>
                                            
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            )}

        </div>
    </div>
)}
        </div>
    );
}