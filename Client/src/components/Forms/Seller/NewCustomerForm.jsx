import { useState } from "react";
import CustomForm from "../CustomForm";
import ShowConfirm from "../ShowConfirm";
import { isAdult,isValidUyId } from "@/lib/validations";



export default function NewCustomerForm({ onRegister, onCancel = () => {}, isDarkMode }) {
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
    // {
    //   name: "email",
    //   label: "Email",
    //   type: "email",
    //   placeholder: "Ingrese el email",
    // },
    {
      name: "fecha_nacimiento",
      label: "Fecha de nacimiento",
      type: "date",
    },
    {
      name: "tipo_descuento",
      label: "Tipo de descuento",
      type: "radio",
      options: [
        { value: "ninguno", label: "Ninguno" },
        { value: "jubilado", label: "Jubilado" },
        { value: "estudiante", label: "Estudiante" },
      ],
    },
  ]

  const validate = (values) => {
    const errors = {}
    if (!values.nombres) errors.nombres = "Campo requerido"
    if (!values.apellidos) errors.apellidos = "Campo requerido"
    if (!values.ci) {
      errors.ci = "Campo requerido"
    } else if (!isValidUyId(values.ci)) {
      errors.ci = "La cédula ingresada no tiene un formato válido"
    }
    if (!values.fecha_nacimiento) {
      errors.fecha_nacimiento = "Campo requerido"
    } else if (!isAdult(values.fecha_nacimiento)) {
      errors.fecha_nacimiento = "No se puede realizar el registro de personas menores de edad"
    }
    return errors
  }

  // Primer submit: muestra confirmación
  const handleSubmit = (values) => {
    console.log("Valores recibidos en handleSubmit:", values)

    // Asegurarmos que tipo_descuento tenga un valor por defecto
    const tipo_descuento = values.tipo_descuento || "ninguno"

    const actualizados = {
      ...values,
      esJubilado: tipo_descuento === "jubilado",
      esEstudiante: tipo_descuento === "estudiante",
      tipo_descuento,
    }

    console.log("Valores actualizados:", actualizados)
    setFormValues(actualizados)
    setShowConfirm(true)
  }

  // Confirmación final
  const handleConfirm = () => {
    if (onRegister && formValues) {
      // no mando la contraseña , dado que se genera automáticamente del lado del backend
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
        title="Alta de Cliente"
        submitText="Registrar Usuario"
        cancelText="Cancelar"
        initialValues={{
          nombres: "",
          apellidos: "",
          //email: "",
          ci: "",
          contraseña: "",
          confirmarContraseña: "",
          tipo_usuario: "CLIENTE",
          fecha_nacimiento: "",
          tipo_descuento: "ninguno", 
          esJubilado: false,
          esEstudiante: false,
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
          data={[
            { label: "Nombres", value: formValues.nombres },
            { label: "Apellidos", value: formValues.apellidos },
            { label: "Cédula", value: formValues.ci },
            // { label: "Email", value: formValues.email },
            { label: "Fecha de nacimiento", value: formValues.fecha_nacimiento },
            {
              label: "Tipo de descuento",
              value:
                formValues.tipo_descuento === "ninguno"
                  ? "Ninguno"
                  : formValues.tipo_descuento === "jubilado"
                    ? "Jubilado"
                    : formValues.tipo_descuento === "estudiante"
                      ? "Estudiante"
                      : formValues.tipo_descuento,
            },
          ]}
          onAccept={async () => {
            setShowConfirm(false)
            await onRegister(formValues)
            onCancel()
          }}
          onCancel={() => handleCancelConfirm()}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  )
}
