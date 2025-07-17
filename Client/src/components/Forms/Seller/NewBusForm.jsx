import { useState, useEffect, useMemo } from "react"
import CustomForm from "../CustomForm"
import { getLocalities } from "@/services"

export default function NewBusForm({ onRegister, onCancel, isDarkMode }) {
  const [localities, setLocalities] = useState([])
  const [loading, setLoading] = useState(true)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const data = await getLocalities()
        setLocalities(data)
      } catch (err) {
        console.error("❌ Error al cargar localidades:", err)
        setFormError("No se pudieron cargar las localidades.")
      } finally {
        setLoading(false)
      }
    }

    fetchLocalities()
  }, [])

  const organizedLocalities = useMemo(() => {
    if (!localities || localities.length === 0) return []

    // Creamos las opciones simples con formato "Localidad - Departamento"
    // Ordenadas primero por departamento, luego por localidad
    return localities
      .map((loc) => ({
        value: loc.id_localidad,
        label: `${loc.nombreLocalidad} - ${loc.departamento?.nombreDepartamento || "Sin Departamento"}`,
        departmentName: loc.departamento?.nombreDepartamento || "Sin Departamento",
        localityName: loc.nombreLocalidad,
      }))
      .sort((a, b) => {
        // Primero ordenamos por departamento
        const deptComparison = a.departmentName.localeCompare(b.departmentName)
        if (deptComparison !== 0) return deptComparison
        // Luego por localidad dentro del mismo departamento
        return a.localityName.localeCompare(b.localityName)
      })
  }, [localities])

  const fields = [
    {
      name: "nro_coche",
      label: "Número de ómnibus",
      type: "number",
      placeholder: "Ingrese el número del ómnibus",
    },
    {
      name: "capacidad",
      label: "Cantidad de asientos",
      type: "number",
      placeholder: "Ingrese la capacidad total",
    },
    {
      name: "id_localidad_actual",
      label: "Localidad de partida",
      type: "select",
      options: organizedLocalities,
      placeholder: "Seleccione localidad de partida...",
    },
    {
      name: "activo",
      label: "Estado del ómnibus",
      type: "radio",
      options: [
        { value: "true", label: "Activo" },
        { value: "false", label: "Inactivo" },
      ],
    },
  ]

  const initialValues = {
    nro_coche: "",
    capacidad: "",
    id_localidad_actual: "",
    activo: "true", // por defecto activo
  }

  const validate = (values) => {
    const errors = {}
    if (!values.nro_coche) errors.nro_coche = "Debe ingresar el número de ómnibus."
    if (!values.capacidad || values.capacidad < 1) {
      errors.capacidad = "Debe ingresar una capacidad válida."
    } else if (values.capacidad > 50) {
      errors.capacidad = "La capacidad máxima permitida es 50."
    }
    if (!values.id_localidad_actual) errors.id_localidad_actual = "Debe seleccionar una localidad."
    if (!values.activo) errors.activo = "Debe seleccionar un estado."
    return errors
  }

  const handleSubmit = (values) => {
    const parsed = {
      nro_coche: values.nro_coche.trim(),
      capacidad: Number.parseInt(values.capacidad, 10),
      id_localidad_actual: Number.parseInt(values.id_localidad_actual, 10),
      activo: values.activo === "true",
    }

    onRegister?.(parsed)
  }

  return (
    <CustomForm
      fields={fields}
      title="Alta de Ómnibus"
      submitText="Registrar"
      cancelText="Cancelar"
      initialValues={initialValues}
      validate={validate}
      onSubmit={handleSubmit}
      onClose={onCancel}
      isDarkMode={isDarkMode}
      withModal={true}
    />
  )
}
