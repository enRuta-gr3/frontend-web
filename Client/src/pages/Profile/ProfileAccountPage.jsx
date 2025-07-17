import { useState, useRef, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import useThemeStore from "@/store/useThemeStore"
import CustomForm from "@/components/Forms/CustomForm";
import ProfileLayout from "@/components/Profile/ProfileLayout"; // Ajustá la ruta si es diferente
import { modificarPerfil } from "@/services"; // Función que llama al backend

export default function ProfileAccountPage() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const usuario = useAuthStore((state) => state.user);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false)

  const successTimeout = useRef(null);
  const errorTimeout = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(successTimeout.current);
      clearTimeout(errorTimeout.current);
    };
  }, []);

  function convertirFechaAInput(dateStr) {
    if (!dateStr) return "";
    return dateStr.split("T")[0]; // "2024-06-14T00:00:00Z" => "2024-06-14"
  }

  const initialValues = {
    nombres: usuario.nombres || "",
    apellidos: usuario.apellidos || "",
    ci: usuario.ci || "",
    email: usuario.email || "",
    fecha_nacimiento: convertirFechaAInput(usuario.fecha_nacimiento),
  };

  const fields = [
    {
      name: "nombres",
      label: "Nombres",
      type: "text",
    },
    {
      name: "apellidos",
      label: "Apellidos",
      type: "text",
    },
    {
      name: "ci",
      label: "Cédula de Identidad",
      type: "text",
      disabled: true,
    },
    {
      name: "email",
      label: "Correo electrónico",
      type: "email",
    },
    {
      name: "fecha_nacimiento",
      label: "Fecha de nacimiento",
      type: "date",
    },
  ];

  const validate = (values) => {
    const errors = {};
    if (!values.nombres) errors.nombres = "El nombre es obligatorio";
    if (!values.apellidos) errors.apellidos = "El apellido es obligatorio"
    if (!values.ci) errors.ci = "La Cédula de identidad es obligaotiro"
    if (!values.email) errors.email = "El email es obligatorio";
    if (!values.fecha_nacimiento) errors.fecha_nacimiento = "Debes indicar una fecha";
    return errors;
  };

  const handleSubmit = async (values) => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
    
    const data = {
      tipo_usuario: usuario.tipo_usuario,
      uuidAuth: usuario.uuidAuth,
      ci: usuario.ci,
      nombres: values.nombres.trim(),
      apellidos: values.apellidos.trim(),
      email: values.email.trim(),
      fecha_nacimiento: values.fecha_nacimiento,
    };

    try {
      console.log("Console data ->>>>>: ", data )
      await modificarPerfil(data); // Llama al backend
      
      // Actualizar el store con los nuevos datos del usuario
      useAuthStore.getState().login(data, useAuthStore.getState().token, useAuthStore.getState().role);
      setSuccessMessage("Perfil actualizado correctamente ✅");
      
      // Mostrar mensaje y ocultar automáticamente
      if (successTimeout.current) clearTimeout(successTimeout.current);
      successTimeout.current = setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      setErrorMessage("Hubo un problema al actualizar tus datos. Intentá nuevamente.");
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
      errorTimeout.current = setTimeout(() => setErrorMessage(""), 4000);
    }finally{
      setLoading(false)
    }
  };

  return (
    <ProfileLayout>
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center text-orange-600">Mi cuenta</h2>

        {successMessage && (
          <div className="bg-green-100 text-green-700 px-4 py-3 mb-4 rounded-lg border border-green-300 text-center">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 text-red-700 px-4 py-3 mb-4 rounded-lg border border-red-300 text-center">
            {errorMessage}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center w-full min-h-[200px]">
              <div className="animate-spin h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <CustomForm
            initialValues={initialValues}
            fields={fields}
            onSubmit={handleSubmit}
            submitText="Modificar perfil"
            validate={validate}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </ProfileLayout>
  );
}