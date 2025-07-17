import { ArrowLeft } from "lucide-react"
import { Button } from "@/components"
import useThemeStore from "@/store/useThemeStore"


export default function BackButton({ onClick, label = "Volver" }) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`mb-4 ${isDarkMode ? "text-white hover:bg-neutral-800" : "text-neutral-700 hover:bg-neutral-100"}`}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}
