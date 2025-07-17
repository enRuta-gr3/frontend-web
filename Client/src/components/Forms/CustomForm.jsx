import { useState, useEffect } from "react"
import { X } from "lucide-react"

export default function CustomForm({
  fields = [],
  onSubmit,
  title = "Nuevo Registro",
  submitText = "Enviar",
  cancelText = "Cancelar",
  initialValues = {},
  isDarkMode,
  validate = () => ({}),
  withModal = false,
  onClose = () => {},
  children,
  confirmModal = false,
  onChange,
  closeOnSubmit = true,
  extraContent = null,
  isLoading = false,
  submitDisabled = false, 
}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const initialValuesRef = useState(initialValues)[0]

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const handleChange = (e) => {
    const { name, value } = e.target
    const newValues = { ...values, [name]: value }

    setValues(newValues)

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    onChange?.({ [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("CustomForm: Enviando formulario con valores:", values)

    const validationErrors = validate(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values)

      if (!confirmModal && withModal && closeOnSubmit) {
        onClose()
      }
    }
  }

  const formContent = (
    <>
      {extraContent}
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <div key={field.name} className="mb-6">
            <label
              htmlFor={`field-${field.name}`}
              className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"} mb-2`}
            >
              {field.label}
            </label>

            {field.type === "select" && field.options ? (
              <select
                id={`field-${field.name}`}
                name={field.name}
                className={`w-full h-12 px-4 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  isDarkMode
                    ? "bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                    : "bg-white border-neutral-300 text-neutral-800 placeholder:text-neutral-500/70"
                } ${errors[field.name] ? "border-red-500" : "border"}`}
                value={values[field.name] || ""}
                onChange={handleChange}
              >
                <option value="">Seleccione una opción</option>
                {Array.isArray(field.options) &&
                  field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
              </select>
            ) : field.type === "radio" && field.options ? (
              <div className="flex gap-6">
                {field.options.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer"
                    htmlFor={`field-${field.name}`}
                  >
                    <input
                      id={`field-${field.name}`}
                      type="radio"
                      name={field.name}
                      value={opt.value}
                      checked={values[field.name] === opt.value}
                      onChange={handleChange}
                      className="accent-orange-500"
                      autoComplete="off"
                    />
                    <span className={isDarkMode ? "text-neutral-200" : "text-neutral-800"}>{opt.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                id={`field-${field.name}`}
                name={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                disabled={field.disabled}
                className={`w-full h-12 px-4 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  isDarkMode
                    ? "bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                    : "bg-white border-neutral-300 text-neutral-800 placeholder:text-neutral-500/70"
                } ${errors[field.name] ? "border-red-500" : "border"}`}
                value={values[field.name] || ""}
                onChange={handleChange}
              />
            )}

            {errors[field.name] && (
              <p className={`mt-1 text-sm ${isDarkMode ? "text-red-400" : "text-red-500"}`}>{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="flex gap-4 mt-8 justify-end">
          {withModal && (
            <button
              type="button"
              className="bg-white border border-neutral-300 text-neutral-800 px-6 py-2 rounded-lg font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
              onClick={onClose}
            >
              {cancelText}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || submitDisabled}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isLoading || submitDisabled
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
            } text-white`}
          >
            {isLoading ? "Cargando..." : submitText}
          </button>
        </div>

        {children}
      </form>
    </>
  )

  return withModal ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className={`${
          isDarkMode ? "bg-neutral-800 text-white" : "bg-white text-neutral-900"
        } rounded-xl shadow-xl max-h-[90vh] w-full max-w-xl flex flex-col`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-700">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full cursor-pointer transition-colors">
            <X className={`w-5 h-5 ${isDarkMode ? "text-white" : "text-neutral-800"}`} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4">{formContent}</div>
      </div>
    </div>
  ) : (
    formContent
  )
}
