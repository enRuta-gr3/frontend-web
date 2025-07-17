import { useState } from "react"
import CustomForm from "../CustomForm"
import ShowConfirm from "../ShowConfirm"
import { isAdult, isValidUyId, isValidEmail } from "@/lib/validations"

export default function NewUserForm({ onRegister, onCancel = () => {}, isDarkMode }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [formValues, setFormValues] = useState(null)

  const fields = [
    {
      name: "nombres",
      label: "Nombres",
      type: "text",
      placeholder: "Ingrese los nombres",
    },
    {
      name: "apellidos",
      label: "Apellidos",
      type: "text",
      placeholder: "Ingrese los apellidos",
    },
    {
      name: "ci",
      label: "Cédula",
      type: "text",
      placeholder: "Ingrese la cédula",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "usuario@enruta.com",
    },
    {
      name: "fecha_nacimiento",
      label: "Fecha de nacimiento",
      type: "date",
    },
    {
      name: "tipo_usuario",
      label: "Tipo de usuario",
      type: "radio",
      options: [
        { value: "VENDEDOR", label: "Vendedor" },
        { value: "ADMINISTRADOR", label: "Administrador" },
      ],
      onChange: (e) => {
        console.log("🟡 Tipo de usuario seleccionado:", e.target.value)
      },
    },
  ]

  const validate = (values) => {
    const errors = {}

    // Validación de nombres
    if (!values.nombres) {
      errors.nombres = "Campo requerido"
    } else if (values.nombres.trim().length < 2) {
      errors.nombres = "Los nombres deben tener al menos 2 caracteres"
    }

    // Validación de apellidos
    if (!values.apellidos) {
      errors.apellidos = "Campo requerido"
    } else if (values.apellidos.trim().length < 2) {
      errors.apellidos = "Los apellidos deben tener al menos 2 caracteres"
    }

    // Validación de cédula
    if (!values.ci) {
      errors.ci = "Campo requerido"
    } else if (!isValidUyId(values.ci)) {
      errors.ci = "La cédula ingresada no tiene un formato válido"
    }

    // Validación de email
    if (!values.email) {
      errors.email = "Campo requerido"
    } else if (!isValidEmail(values.email)) {
      errors.email = "El formato del correo electrónico no es válido"
    } else if (!values.email.includes("@enruta")) {
      errors.email = "Debe usar un correo corporativo (@enruta)"
    }

    // Validación de fecha de nacimiento
    if (!values.fecha_nacimiento) {
      errors.fecha_nacimiento = "Campo requerido"
    } else if (!isAdult(values.fecha_nacimiento)) {
      errors.fecha_nacimiento = "El usuario debe ser mayor de edad"
    }

    // Validación de tipo de usuario
    if (!values.tipo_usuario) {
      errors.tipo_usuario = "Debe seleccionar un tipo de usuario"
    }

    return errors
  }

  // Primer submit: muestra confirmación
  const handleSubmit = (values) => {
    const tipo_usuario = values.tipo_usuario      
    ? values.tipo_usuario.toUpperCase()
    : "VENDEDOR"

    const actualizados = {
      ...values,
      tipo_usuario,
      esAdministrador: tipo_usuario === "ADMINISTRADOR",
      esVendedor: tipo_usuario === "VENDEDOR",
    }

    setFormValues(actualizados)
    setShowConfirm(true)
  }

  // Confirmación final
  const handleConfirm = () => {
    if (onRegister && formValues) {
      console.log("🚀 [NewUserForm] Enviando datos para registro:", formValues)
      // La contraseña se genera automáticamente en el backend
      onRegister({ ...formValues })
    }
    setShowConfirm(false)
    setFormValues(null)
  }

  // Cancelar confirmación
  const handleCancelConfirm = () => {
    setShowConfirm(false)
  }

  return (
    <>
      {/* Modal principal con CustomForm */}
      <CustomForm
        fields={fields}
        title="Alta de Usuario Interno"
        submitText="Registrar Usuario"
        cancelText="Cancelar"
        initialValues={{
          nombres: "",
          apellidos: "",
          ci: "",
          email: "",
          fecha_nacimiento: "",
          tipo_usuario: "VENDEDOR", // Valor por defecto
          esAdministrador: false,
          esVendedor: true,
        }}
        validate={validate}
        onSubmit={handleSubmit}
        isDarkMode={isDarkMode}
        withModal={true}
        onClose={onCancel}
        confirmModal={true}
      />

      {/* Modal de confirmación, solo visible si showConfirm es true */}
      {showConfirm && formValues && (
        <ShowConfirm
          open={showConfirm}
          title="¿Confirmar registro de usuario interno?"
          data={[
            { label: "Nombres", value: formValues.nombres },
            { label: "Apellidos", value: formValues.apellidos },
            { label: "Cédula", value: formValues.ci },
            { label: "Email", value: formValues.email },
            { label: "Fecha de nacimiento", value: formValues.fecha_nacimiento },
            {
              label: "Tipo de usuario",
              value: formValues.tipo_usuario === "ADMINISTRADOR" ? "Administrador" : "Vendedor",
            },
          ]}
          onAccept={async () => {
            setShowConfirm(false)
            await onRegister(formValues)
            onCancel()
          }}
          onCancel={() => handleCancelConfirm()}
        //   acceptText="Confirmar Registro"
        //   cancelText="Revisar Datos"
          isDarkMode={isDarkMode}
        />
      )}
    </>
  )
}
