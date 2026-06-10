export const USERS = [
  { usuario: "Jorge", password: "Jorge123", rol: "OTI" },
  { usuario: "academico", password: "123", rol: "ASUNTOS_ACADEMICOS" },
  { usuario: "caja", password: "Caja2026", rol: "CAJA" },
];

export function loginUser(usuario, password) {
  return USERS.find(
    (u) => u.usuario === usuario && u.password === password
  );
}

export function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser() {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

export function logout() {
  localStorage.removeItem("user");
}