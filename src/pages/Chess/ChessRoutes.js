import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ChessRoutes() {
  const { user } = useAuth(); // your AuthContext
  return user ? <Outlet /> : <Navigate to="/chess" />;
}
