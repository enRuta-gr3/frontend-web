import { useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import useThemeStore from "@/store/useThemeStore"
import { CustomForm, ProfileLayout } from "@/components";
import { cambiarContraseña } from "@/services"; // Función que llama al backend
import {checkPassowrdLength, checkPasswordMatch} from '@/lib/validations'

export default function ProfileAccountPage() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  const usuario = useAuthStore((state) => state.user);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false)

  

  const initialValues = {
    contrasenia: "",
    nuevaContrasenia: "",
    confirmacionNuevaContrasenia: "",
  };

  const fields = [
    {
      name: "contrasenia",
      label: "Contraseña actual",
      type: "password",
      placeholder: "Ingresá tu contraseña actual",
    },
    {
      name: "nuevaContrasenia",
      label: "Contraseña nueva",
      type: "password",
      placeholder: "Ingresá tu contraseña nueva",
    },{
      name: "confirmacionNuevaContrasenia",
      label: "Repite tu nueva contraseña",
      type: "password",
      placeholder: "Reingresá tu contraseña nueva",
    },
  ];

  const validate = (values) => {
    const errors = {}
    if (!values.contrasenia) errors.contrasenia = "La contraseña actual es obligatoria"
    if (!values.nuevaContrasenia) errors.nuevaContrasenia = "La nueva contraseña es obligatoria"
    if (values.nuevaContrasenia && !checkPassowrdLength(values.nuevaContrasenia)) {
      errors.nuevaContrasenia = "La contraseña debe tener al menos 6 caracteres";
    }
    if (!checkPasswordMatch(values.nuevaContrasenia,values.confirmacionNuevaContrasenia) ) {
      errors.confirmacionNuevaContrasenia = "Las contraseñas no coinciden"
    }

    return errors
  }

  const handleSubmit = async (values) => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true)

    try {
      const data = {
        email: usuario.email || usuario.ci,
        contraseña: values.contrasenia,
        contraseña_nueva: values.nuevaContrasenia,
      };
      await cambiarContraseña(data); // Llama al backend
      setSuccessMessage("La contraseña se ha actualizado correctamente ✅");
    } catch (error) {
      setErrorMessage("Hubo un problema al cambiar  la contraseña. Intentá nuevamente.");
    } finally {
      setLoading(false)
    }
  };

  return (
    <ProfileLayout>
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center text-orange-600">Cambiar contraseña</h2>

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
            fields={fields}
            onSubmit={handleSubmit}
            initialValues={initialValues}
            isDarkMode={isDarkMode}
            title=""
            submitText="Guardar cambios"
            validate={validate}
          />
        )}
      </div>
    </ProfileLayout>
  );
}