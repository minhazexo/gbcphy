// hooks/useCurrentPath.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useCurrentPath = () => {
  const location = useLocation();

  useEffect(() => {
    // Save the current path to local storage
    localStorage.setItem("currentPath", location.pathname);
  }, [location.pathname]);
};

export default useCurrentPath;
