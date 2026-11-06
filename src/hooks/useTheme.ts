// Theme hook. Thin wrapper around ThemeContext.

import { useTheme } from "../context/ThemeContext.tsx";

export const useThemeHook = () => {
  const theme = useTheme();
  return {
    theme: theme.theme,
    toggleTheme: theme.toggleTheme,
  };
};

export default useThemeHook;
