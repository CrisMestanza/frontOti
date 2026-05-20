export const saveUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export const logout = () => {
  localStorage.removeItem("user");
};

export const isSuperAdmin = () => {
  const user = getUser();
  return user?.rol === "SUPERADMIN";
};

export const isOTI = () => {
  const user = getUser();
  return user?.rol === "OTI";
};

// 🔥 REGLA PRINCIPAL
export const canSeeAllLinks = () => {
  const user = getUser();
  return user?.rol === "SUPERADMIN" || user?.rol === "OTI";
};