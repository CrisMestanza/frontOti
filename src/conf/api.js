// src/conf/api.js

export const API_BASE = "http://192.168.50.108:8004/api";
// export const API_BASE = "http://127.0.0.1:8000/api";

export const API = {

  getPeriodo: `${API_BASE}/getPeriodo/`,
  comedor: `${API_BASE}/comedor/`,

  studentsDni: (dni) =>
    `${API_BASE}/getStudentsDni/${dni}/`,

  studentsPeriodoDni: (dni, periodo) =>
    `${API_BASE}/getStudentsPeriodoDni/${dni}/${periodo}/`,

  cambioEstado: `${API_BASE}/cambioEstado/`,
  cambioBeca: `${API_BASE}/cambioBeca/`,

  gmailUpload: `${API_BASE}/gmail/`,
  sendMail: `${API_BASE}/enviar-correo/`,

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
  getEncuesta: `${API_BASE}/getencuesta/`,
  getEncuestas: `${API_BASE}/getencuestas/`,

  getPorTipoEnccuesta: (tipo) =>
    `${API_BASE}/getporencuesta/${tipo}/`,  
  
  getEncuestaDocente: (dni) =>
    `${API_BASE}/getencuestadocente/${dni}/`,

  getEncuestaDepartamento: (id) =>
    `${API_BASE}/getencuestadepartamento/${id}/`,

  getDepartamentos: `${API_BASE}/getdepartamentos/`,

  getDocente: (dni) =>
    `${API_BASE}/getdocentes/${dni}/`,

  
};