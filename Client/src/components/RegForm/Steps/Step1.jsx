
import { User, Calendar, Mail, BadgeCheck, Percent } from "lucide-react"
import FormInput from "../Elements/FormInput"

function Step1({ formData, errors, handleChange, handleDiscountChange, isDarkMode = true }) {
  return (
    <div className="space-y-4">
      <FormInput
        icon={User}
        label="Nombres"
        name="nombres"
        value={formData.nombres}
        error={errors.nombres}
        onChange={handleChange}
        placeholder="Ej: Juan Pérez"
        isDarkMode={isDarkMode}
      />
      <FormInput
        icon={User}
        label="Apellidos"
        name="apellidos"
        value={formData.apellidos}
        error={errors.apellidos}
        onChange={handleChange}
        placeholder="Ej: González"
        isDarkMode={isDarkMode}
      />
      <FormInput
        icon={Calendar}
        label="Fecha de nacimiento"
        name="fecha_nacimiento"
        value={formData.fecha_nacimiento}
        error={errors.fecha_nacimiento}
        onChange={handleChange}
        type="date"
        isDarkMode={isDarkMode}
      />
      <FormInput
        icon={Mail}
        label="Correo electrónico"
        name="email"
        type="email"
        value={formData.email}
        error={errors.email}
        onChange={handleChange}
        placeholder="tu@correo.com"
        isDarkMode={isDarkMode}
      />
      <FormInput
        icon={BadgeCheck}
        label="Cédula de identidad"
        name="ci"
        value={formData.ci}
        error={errors.ci}
        onChange={handleChange}
        placeholder="Ej: 12345678"
        isDarkMode={isDarkMode}
      />

      {/* Sección de descuentos */}
       <div>
        <label
          className={`flex items-start flex-col text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"} mb-2`}
        >
          <div className="flex items-center">
            <Percent className={`h-5 w-5 mr-2 ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`} />
            Si corresponde:
          </div>
          <span className={` mt-1 ml-7 text-xs ${isDarkMode ? "text-neutral-400" : "text-neutral-500"}`}>
            (Si selecciona 'Jubilado' o 'Estudiante', deberá presentar la documentación correspondiente en el mostrador para validar el descuento en sus pasajes)
          </span>
        </label>

        <div className={`flex flex-row gap-4 mt-4 pl-10 ${errors.tipo_descuento ? "text-red-500" : ""}`}>
          <div className="flex items-center">
            <input
              type="radio"
              id="sin_descuento"
              name="tipo_descuento"
              value="Ninguno"
              checked={formData.tipo_descuento === "Ninguno"}
              onChange={() => handleDiscountChange("Ninguno")}
              className={`h-4 w-4 ${
                isDarkMode
                  ? "bg-white/10 border-white/20 text-orange-500 focus:ring-orange-500"
                  : "bg-white border-neutral-300 text-orange-500 focus:ring-orange-500"
              }`}
            />
            <label htmlFor="sin_descuento" className={`ml-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Ninguno
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="radio"
              id="jubilado"
              name="tipo_descuento"
              value="jubilado"
              checked={formData.tipo_descuento === "jubilado"}
              onChange={() => handleDiscountChange("jubilado")}
              className={`h-4 w-4 ${
                isDarkMode
                  ? "bg-white/10 border-white/20 text-orange-500 focus:ring-orange-500"
                  : "bg-white border-neutral-300 text-orange-500 focus:ring-orange-500"
              }`}
            />
            <label htmlFor="jubilado" className={`ml-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Jubilado
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="radio"
              id="estudiante"
              name="tipo_descuento"
              value="estudiante"
              checked={formData.tipo_descuento === "estudiante"}
              onChange={() => handleDiscountChange("estudiante")}
              className={`h-4 w-4 ${
                isDarkMode
                  ? "bg-white/10 border-white/20 text-orange-500 focus:ring-orange-500"
                  : "bg-white border-neutral-300 text-orange-500 focus:ring-orange-500"
              }`}
            />
            <label htmlFor="estudiante" className={`ml-2 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              Estudiante
            </label>
          </div>
        </div>

        {errors.tipo_descuento && (
          <p className={`mt-1 text-sm ${isDarkMode ? "text-red-400" : "text-red-500"}`}>{errors.tipo_descuento}</p>
        )}
      </div>
    </div>
  )
}

export default Step1
