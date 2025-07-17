import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import useThemeStore from "../../store/useThemeStore" 

export default function ThemeSwitcher() {
  const { isDarkMode, toggleTheme } = useThemeStore()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full transition-colors cursor-pointer"
      aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {!isDarkMode ? (
        <Moon className="h-5 w-5 text-neutral-700 hover:text-black" />
      ) : (
        <Sun className="h-5 w-5 text-white hover:text-orange-300" />
      )}
    </Button>
  )
}
