import {ProfileLayout} from "@/components"
import useThemeStore from "@/store/useThemeStore"

export default function ProfilePage() {
  const isDarkMode = useThemeStore(state => state.isDarkMode)

  return (
    <ProfileLayout>
      <div className="mb-6 text-center">
        <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
          Bienvenido a tu perfil
        </h1>
        <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
          Desde aquí podés ver y gestionar tu cuenta y tus pasajes.
        </p>
      </div>
    </ProfileLayout>
  )
}