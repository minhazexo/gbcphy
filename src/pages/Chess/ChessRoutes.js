import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ChessRoutes() {
  const { userProfile } = useAuth();
  return userProfile ? <Outlet /> : <Navigate to="/chess" />;
}
