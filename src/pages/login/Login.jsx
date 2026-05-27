import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { loginUser, setUser } from "../../auth";
import Swal from "sweetalert2";
import logo from "../../assets/logo.png";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (usuario.trim() === "" || password.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "Por favor ingresa usuario y contraseña",
      });
      return;
    }

    const user = loginUser(usuario, password);

    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Credenciales incorrectas",
      });
      return;
    }

    setUser(user);

    navigate(user.rol === "OTI" ? "/dashboard" : "/encuestas");
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.bubbles}>
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>

        <div className={styles.card}>
          <div className={styles.logoBox}>
            <img src={logo} alt="logo" />
          </div>

          <h1 className={styles.title}>
            Universidad Nacional de San Martín
          </h1>

          <p className={styles.subtitle}>
            Accede con tus credenciales institucionales
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>

            {/* USER */}
            <div className={styles.inputGroup}>
              <span className="material-symbols-outlined">person</span>
              <input
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Usuario"
              />
            </div>

            {/* PASSWORD */}
            <div className={styles.inputGroup}>
              <span className="material-symbols-outlined">lock</span>

              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
              />

              <span
                className={styles.eye}
                onClick={() => setShowPass(!showPass)}
              >
                <span className="material-symbols-outlined">
                  {showPass ? "visibility_off" : "visibility"}
                </span>
              </span>
            </div>

            <button className={styles.button}>Ingresar</button>
          </form>
        </div>
      </div>

      <div className={styles.right}></div>
    </div>
  );
}