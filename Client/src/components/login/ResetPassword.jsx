import { useState } from 'react';
import CustomForm from "../Forms/CustomForm"
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useThemeStore from "@/store/useThemeStore"
import { ThemeSwitcher } from "@/components"
import logo from "@/assets/logo.webp";
import { confirmarRecuperacion } from "@/services";

export default function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const navigate = useNavigate()

  const handleSubmit = async (formValues) => {
    setError(""); // limpiamos errores anteriores
    setLoading(true)

    try {
      await confirmarRecuperacion(token, formValues.nuevaPassword.trim());// llamada al servicio
      setSubmitted(true); // mostrar mensaje de éxito
    } catch (err) {
      console.log("->> Error en resetPass: ", err)
      setError("Hubo un problema al cambiar la contraseña. Reintente nuevamente.");
    }finally{
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "nuevaPassword",
      label: "Nueva contraseña",
      type: "password",
      placeholder: "Ingresá tu nueva contraseña",
    },
    {
      name: "confirmarPassword",
      label: "Confirmar contraseña",
      type: "password",
      placeholder: "Repetí tu nueva contraseña",
    },
  ]

  const validate = (values) => {
    const errors = {}

    if (!values.nuevaPassword) {
      errors.nuevaPassword = "Debe ingresar una contraseña"
    }

    if (!values.confirmarPassword) {
      errors.confirmarPassword = "Debe ingresar una contraseña"
    }

    if (values.nuevaPassword !== values.confirmarPassword){
      errors.confirmarPassword = "Las contraseñas deben coincidir"
      errors.nuevaPassword = "Las contraseñas deben coincidir"
    }

    return errors
  }


  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 
      ${isDarkMode 
        ? "bg-gradient-to-b from-black/90 via-black/80 to-black/90" 
        : "bg-gradient-to-b from-white/80 via-white/70 to-white/80"}`}>
      {/* Barra de navegación */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-end items-center">
          <ThemeSwitcher />
        </div>
      </div>
      <div className={`${isDarkMode ? "bg-neutral-800 border-neutral-700" : "bg-white/90 border border-neutral-300"} max-w-md w-full rounded-xl shadow-xl overflow-hidden`}>
        <div className="flex flex-col items-center p-8">
          {/* Logo */}
          <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center mb-4">
            <img src={logo} className="h-full rounded-full text-white" alt="En Ruta" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>Recuperacion de contraseña</h1>
          <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"} text-sm mb-6 text-center`}>
            Ingresa una nueva contraseña para recuperarla.
          </p>

          {/* Mensaje de error */}
          {error && (
            <div className="w-full bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4 border border-red-300 text-center">
              {error}
            </div>
          )}

          {/* Formulario o mensaje de éxito */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="w-full bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-4 border border-green-300 text-center">
                ¡Contraseña cambiada, ahora puedes regresar al login!
              </div>
              <button
                className={`flex items-center mt-2 ${isDarkMode ? "text-white" : "text-neutral-800"} hover:text-orange-500 transition-colors`}
                onClick={() => navigate('/login')}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Ir a loguearme</span>
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center w-full min-h-[200px]">
              <div className="animate-spin h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="relative w-full">
              <CustomForm
                initialValues={{
                  nuevaPassword: "",
                  confirmarPassword: "",
                }}
                fields={fields}
                onSubmit={handleSubmit}
                submitText="Enviar"
                isDarkMode={isDarkMode}
                validate={validate}
                withModal={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}