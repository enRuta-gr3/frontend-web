import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useThemeStore from "@/store/useThemeStore"
import { ThemeSwitcher } from "@/components"
import logo from "@/assets/logo.webp";
import { recoverPassword } from "@/services";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const navigate = useNavigate()
  const handleRedirectTo = ()=> navigate(-1)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // limpiamos errores anteriores
    setLoading(true)
    try {
      await recoverPassword(email.trim());// llamada al servicio
      setSubmitted(true); // mostrar mensaje de éxito
    } catch (err) {
      setError("Hubo un problema al enviar el correo. Reintente nuevamente.");
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 
      ${isDarkMode 
        ? "bg-gradient-to-b from-black/90 via-black/80 to-black/90" 
        : "bg-gradient-to-b from-white/80 via-white/70 to-white/80"}`}>
      {/* Barra de navegación */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button
            className={`flex items-center ${isDarkMode ? "text-white" : "text-neutral-800"} hover:text-orange-500 transition-colors`}
            onClick={handleRedirectTo}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Volver atrás</span>
          </button>
          <ThemeSwitcher />
        </div>
      </div>
      <div className={`${isDarkMode ? "bg-neutral-800 border-neutral-700" : "bg-white/90 border border-neutral-300"} max-w-md w-full rounded-xl shadow-xl overflow-hidden`}>
        <div className="flex flex-col items-center p-8">
          {/* Logo */}
          <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center mb-4">
            <img src={logo} className="h-full rounded-full text-white" alt="En Ruta" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>¿Olvidaste tu contraseña?</h1>
          <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"} text-sm mb-6 text-center`}>
            Por favor, ingresa tu correo electrónico. Recibirás un enlace para crear una nueva contraseña.
          </p>
          {submitted ? (
            <div className="w-full bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4 border border-green-300 text-center">
              ¡Listo! Si tu email existe, revisa tu correo electrónico para cambiar tu contraseña.
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center w-full min-h-[200px]">
              <div className="animate-spin h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full">
              {error && (
                <div className="w-full bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 border border-red-300 text-center">
                  {error}
                </div>
              )}
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-neutral-300" : "text-neutral-900"}`}>
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="tu@email.com"
                className={`w-full h-12 rounded-lg border px-4 mb-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                  ${isDarkMode 
                    ? "bg-neutral-700 border-neutral-600 text-white" 
                    : "bg-neutral-100 border-neutral-300 text-neutral-900"}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 rounded-lg font-medium transition-colors"
              >
                Obtener una contraseña nueva
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}