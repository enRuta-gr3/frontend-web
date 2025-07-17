import CustomForm from "../CustomForm"
import useDepartments from "@/hooks/useDepartment"

export default function NewLocationForm({ onLocationCreated, onCancel, isDarkMode }) {
  // Importamos el hook para obtener los departamentos
  const { departments } = useDepartments()

  console.log("NewLocationForm: Departamentos disponibles:", departments)

  // Definición de campos para el formulario
  const fields = [
    {
      name: "id_departamento",
      label: "Departamento",
      type: "select",
      options: departments.map((dep) => ({
        value: dep.id_departamento,
        label: dep.nombreDepartamento,
      })),
    },
    {
      name: "nombreLocalidad",
      label: "Nombre de la localidad",
      type: "text",
      placeholder: "Ingrese el nombre de la localidad",
    },
  ]

  // Validación simplificada - solo campos requeridos
  const validate = (values) => {
    const errors = {}

    if (!values.id_departamento) {
      errors.id_departamento = "Debe seleccionar un departamento"
    }

    if (!values.nombreLocalidad || !values.nombreLocalidad.trim()) {
      errors.nombreLocalidad = "Debe ingresar el nombre de la localidad"
    } else if (values.nombreLocalidad.trim().length < 2) {
      errors.nombreLocalidad = "El nombre debe tener al menos 2 caracteres"
    }

    return errors
  }

  // Manejo del submit - recibe los valores directamente del CustomForm
  const handleSubmit = (formValues) => {
    const selectedDep = departments.find((d) => d.id_departamento === Number(formValues.id_departamento))
    const enrichedForm= {
      ...formValues,
      nombreDepartamento: selectedDep ?.nombreDepartamento || "",
    }
    console.log("[NewLocationForm.jsx - handleSubmit] 📄Formulario enviado con valores:", enrichedForm)

    onLocationCreated?.(enrichedForm)
  }

  return (
    <CustomForm
      fields={fields}
      title="Alta de localidad"
      submitText="Crear Localidad"
      cancelText="Cancelar"
      initialValues={{
        id_departamento: "",
        nombreDepartamento:"",
        nombreLocalidad: "",
      }}
      validate={validate}
      onSubmit={handleSubmit}
      isDarkMode={isDarkMode}
      withModal={true}
      onClose={onCancel}
    />
  )
}
