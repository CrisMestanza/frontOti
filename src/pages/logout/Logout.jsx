import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../auth";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate("/login");
  }, []);

  return null;
}