import { useState, useMemo } from "react"
import CustomForm from "../CustomForm"
import useLocalities from "@/hooks/useLocalities"
import useBuses from "@/hooks/useBuses"

export default function NewTripForm({ onTripCreated, onCancel, isDarkMode }) {
  const [showStep2, setShowStep2] = useState(false)
  const [formValues, setFormValues] = useState(null)
  const [availableBuses, setAvailableBuses] = useState([])

  const { localities } = useLocalities()
  const { loadAvailableBusForNewTrip } = useBuses()

  const [isLoadingStep, setIsLoadingStep] = useState(false)

  const organizedLocalities = useMemo(() => {
    return (localities || [])
      .map((loc) => ({
        value: loc.id_localidad,
        label: `${loc.nombreLocalidad} - ${loc.departamento?.nombreDepartamento || "Sin Departamento"}`,
        departmentName: loc.departamento?.nombreDepartamento || "Sin Departamento",
        localityName: loc.nombreLocalidad,
      }))
      .sort((a, b) => {
        const deptCompare = a.departmentName.localeCompare(b.departmentName)
        return deptCompare !== 0 ? deptCompare : a.localityName.localeCompare(b.localityName)
      })
  }, [localities])

  const validateStep1 = (values) => {
    const errors = {}
    if (!values.localidadOrigen) errors.localidadOrigen = "Campo requerido"
    if (!values.localidadDestino) errors.localidadDestino = "Campo requerido"
    if (!values.fecha_partida) errors.fecha_partida = "Campo requerido"
    if (!values.fecha_llegada) errors.fecha_llegada = "Campo requerido"
    if (!values.hora_partida) errors.hora_partida = "Campo requerido"
    if (!values.hora_llegada) errors.hora_llegada = "Campo requerido"
    if (!values.precio_viaje) errors.precio_viaje = "Campo requerido"
    if (values.localidadOrigen === values.localidadDestino) {
      errors.localidadDestino = "Localidad origen y destino deben ser distintas."
    }

    if (values.fecha_partida && values.fecha_llegada && values.hora_partida && values.hora_llegada) {
      const salida = new Date(`${values.fecha_partida}T${values.hora_partida}:00`)
      const llegada = new Date(`${values.fecha_llegada}T${values.hora_llegada}:00`)

      if (values.fecha_partida === values.fecha_llegada && values.hora_partida === values.hora_llegada) {
        errors.hora_llegada = "La hora de llegada no puede ser igual a la hora de salida."
      }

      if (llegada < salida) {
        errors.hora_llegada = "La hora de llegada no puede ser anterior a la salida."
      }
    }

    if (values.fecha_partida && values.fecha_llegada) {
      const hoy = new Date().toISOString().split("T")[0]
      if (values.fecha_partida < hoy) {
        errors.fecha_partida = "La fecha de salida no puede ser anterior al día actual."
      }
      if (values.fecha_llegada < hoy) {
        errors.fecha_llegada = "La fecha de llegada no puede ser anterior al día actual."
      }
    }

    if (values.fecha_partida && values.hora_partida) {
      const hoyStr = new Date().toISOString().split("T")[0]
      const ahora = new Date()

      if (values.fecha_partida === hoyStr) {
        const salida = new Date(`${values.fecha_partida}T${values.hora_partida}:00`)
        if (salida < ahora) {
          errors.hora_partida = "La hora de salida no puede ser anterior a la actual."
        }
      }
    }

    const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!horaRegex.test(values.hora_partida)) errors.hora_partida = "Formato incorrecto hh:mm"
    if (!horaRegex.test(values.hora_llegada)) errors.hora_llegada = "Formato incorrecto hh:mm"
    return errors
  }

  const handleStep1Submit = async (values) => {
    setIsLoadingStep(true)

    const payload = {
      fecha_partida: values.fecha_partida,
      hora_partida: values.hora_partida + ":00",
      fecha_llegada: values.fecha_llegada,
      hora_llegada: values.hora_llegada + ":00",
      localidadOrigen: { id_localidad: Number(values.localidadOrigen) },
      localidadDestino: { id_localidad: Number(values.localidadDestino) },
    }

    try {
      const buses = await loadAvailableBusForNewTrip(payload)
      setFormValues(values)
      setAvailableBuses(buses)
      setShowStep2(true)
    } catch (error) {
      alert("No se pudieron obtener ómnibus.")
    } finally {
      setIsLoadingStep(false)
    }
  }

  const validateStep2 = (values) => {
    const errors = {}
    if (availableBuses.length > 0 && !values.omnibus) {           // si hay ómnibus disponibles y no se selecciona alguno, emitimos un error.
      errors.omnibus = "Debe seleccionar un ómnibus"
    }
    return errors
  }

  const handleStep2Submit = (values) => {
    const finalPayload = {
      ...formValues,
      hora_partida: formValues.hora_partida + ":00",
      hora_llegada: formValues.hora_llegada + ":00",
      precio_viaje: Number(formValues.precio_viaje),
      estado: "ABIERTO",
      localidadOrigen: { id_localidad: Number(formValues.localidadOrigen) },
      localidadDestino: { id_localidad: Number(formValues.localidadDestino) },
      omnibus: { id_omnibus: Number(values.omnibus) },
    }

    onTripCreated?.(finalPayload)
  }

  const fieldsStep1 = [
    { name: "localidadOrigen", label: "Localidad Origen", type: "select", options: organizedLocalities },
    { name: "localidadDestino", label: "Localidad Destino", type: "select", options: organizedLocalities },
    { name: "fecha_partida", label: "Fecha de Salida", type: "date" },
    { name: "hora_partida", label: "Hora de Salida", type: "text", placeholder: "hh:mm" },
    { name: "fecha_llegada", label: "Fecha de Llegada", type: "date" },
    { name: "hora_llegada", label: "Hora de Llegada", type: "text", placeholder: "hh:mm" },
    { name: "precio_viaje", label: "Precio del Viaje", type: "text", placeholder: "2000" },
  ]

 
  const fieldsStep2 =
    availableBuses.length > 0                       
      ? [
          {
            name: "omnibus",
            label: "Ómnibus disponibles",
            type: "select",
            options: availableBuses.map((bus) => ({
              value: bus.id_omnibus,
              label: `Coche #${bus.nro_coche} - ${bus.capacidad} asientos`,
            })),
            placeholder: "Seleccione un ómnibus...",
          },
        ]
      : []

  const origenLabel = formValues?.localidadOrigen
    ? organizedLocalities.find((l) => l.value === Number(formValues.localidadOrigen))?.label
    : "No seleccionado"

  const destinoLabel = formValues?.localidadDestino
    ? organizedLocalities.find((l) => l.value === Number(formValues.localidadDestino))?.label
    : "No seleccionado"

  const tripSummary = formValues && (
    <div
      className={`mb-6 p-4 rounded-md ${isDarkMode ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800"}`}
    >
      <h3 className="font-semibold mb-2">Resumen del viaje</h3>
      <ul className="space-y-1 text-sm">
        <li>
          <strong>Origen:</strong> {origenLabel || "—"}
        </li>
        <li>
          <strong>Destino:</strong> {destinoLabel || "—"}
        </li>
        <li>
          <strong>Salida:</strong> {formValues.fecha_partida} {formValues.hora_partida}
        </li>
        <li>
          <strong>Llegada:</strong> {formValues.fecha_llegada} {formValues.hora_llegada}
        </li>
        <li>
          <strong>Precio:</strong> $ {formValues.precio_viaje}
        </li>
      </ul>
    </div>
  )

  // Contenido adicional para cuando no hay buses disponibles
  const noBusesContent = availableBuses.length === 0 && (
    <div className="mb-6">
      <h4 className={`font-medium mb-2 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>Ómnibus disponibles</h4>
      <span className="text-red-500 font-medium">No hay ómnibus disponibles</span>
    </div>
  )

  return (
    <>
      {!showStep2 && (
        <CustomForm
          fields={fieldsStep1}
          title="Alta de Viaje"
          submitText="Continuar"
          cancelText="Cancelar"
          initialValues={
            formValues || {
              localidadOrigen: "",
              localidadDestino: "",
              fecha_partida: "",
              fecha_llegada: "",
              hora_partida: "",
              hora_llegada: "",
              precio_viaje: "",
            }
          }
          validate={validateStep1}
          onSubmit={handleStep1Submit}
          onClose={onCancel}
          isDarkMode={isDarkMode}
          withModal={true}
          onChange={(values) => setFormValues((prev) => ({ ...prev, ...values }))}
          closeOnSubmit={false}
          isLoading={isLoadingStep}
        />
      )}

      {showStep2 && (
        <CustomForm
          fields={fieldsStep2}
          title="Seleccione el ómnibus"
          submitText={availableBuses.length > 0 ? "Confirmar Viaje" : "Confirmar Viaje"}
          cancelText="Volver"
          initialValues={{ omnibus: null }}
          validate={validateStep2}
          onSubmit={availableBuses.length > 0 ? handleStep2Submit : () => {}}
          onClose={() => setShowStep2(false)}
          isDarkMode={isDarkMode}
          withModal={true}
          extraContent={
            <>
              {tripSummary}
              {noBusesContent}
            </>
          }
          submitDisabled={availableBuses.length === 0}
        />
      )}
    </>
  )
}
