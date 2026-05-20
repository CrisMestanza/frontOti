// src/conf/api.js

export const API_BASE = "http://192.168.161.96:8000/api";

export const API = {

  // 🔹 BECAS / COMEDOR
  getPeriodo: `${API_BASE}/getPeriodo/`,
  comedor: `${API_BASE}/comedor/`,

  studentsDni: (dni) =>
    `${API_BASE}/getStudentsDni/${dni}/`,

  studentsPeriodoDni: (dni, periodo) =>
    `${API_BASE}/getStudentsPeriodoDni/${dni}/${periodo}/`,

  cambioEstado: `${API_BASE}/cambioEstado/`,
  cambioBeca: `${API_BASE}/cambioBeca/`,

  // 🔹 CORREOS
  gmailUpload: `${API_BASE}/gmail/`,
  sendMail: `${API_BASE}/enviar-correo/`,

  // 🔹 REPORTES
  getApplicationTerms: (periodoId) =>
    `${API_BASE}/getApplicationTerms/${periodoId}`,

  generarReportes: (termId) =>
    `${API_BASE}/generarReportes/${termId}`,

  // 🔹 COMEDOR / PAGOS
  getUser: `${API_BASE}/getUser`,

  getEstudianteDni: (dni) =>
    `${API_BASE}/getestudiantedi/${dni}`,

  getPagos: (dni) =>
    `${API_BASE}/getPagos/${dni}`,

  deletePago: (id) =>
    `${API_BASE}/deletePagos/${id}/`,

  // 🔹 ENCUESTAS
  getEncuestas: `${API_BASE}/getencuesta/`,

  getEncuestaDocente: (dni) =>
    `${API_BASE}/getencuestadocente/${dni}/`,

  getEncuestaDepartamento: (id) =>
    `${API_BASE}/getencuestadepartamento/${id}/`,

  getDepartamentos: `${API_BASE}/getdepartamentos/`,

  getDocente: (dni) =>
    `${API_BASE}/getdocentes/${dni}/`,
};