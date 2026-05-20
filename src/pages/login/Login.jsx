import { useState } from "react";
import styles from "./Login.module.css";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ usuario, password });
  };

  return (
    <div className={styles.container}>
      {/* LEFT PANEL */}
      <div className={styles.left}>
        <div className={styles.card}>
          <img
            src="src/assets/logo.png"
            alt="logo"
            className={styles.logo}
          />

          <h1 className={styles.title}>SISTEMA DE GESTION</h1>

          <p className={styles.subtitle}>
            Ingresa tus credenciales para acceder al sistema de gestion insitucional 
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label>USUARIO</label>
            <input
              type="text"
              placeholder="ej. alexj"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />

            <label>CONTRASEÑA</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className={styles.row}>
              <label className={styles.remember}>
                <input type="checkbox" /> Recordarme
              </label>

              <a href="#" className={styles.link}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className={styles.button}>
              INGRESAR AL SISTEMA
            </button>

            <p className={styles.footer}>
              © 2026 FISI - UNSM. Todos los derechos reservados.
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className={styles.right}></div>
    </div>
  );
}