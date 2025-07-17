

import { Eye, EyeOff } from "lucide-react"

export default function FormInput({
  icon: Icon,
  label,
  type = "text",
  name,
  value,
  error,
  onChange,
  placeholder,
  showVisibilityToggle,
  onToggleVisibility,
  isPasswordVisible,
  isDarkMode = true,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className={`block text-sm font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"} mb-1`}
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Icon className={`h-5 w-5 ${isDarkMode ? "text-neutral-500" : "text-neutral-600"}`} />
        </div>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`pl-10 w-full h-12 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
            isDarkMode
              ? "bg-white/10 border-white/20 text-white placeholder:text-neutral-500"
              : "bg-white/70 border-neutral-300 text-neutral-800 placeholder:text-neutral-500/70"
          } ${error ? "border-red-500" : "border"}`}
          value={value}
          onChange={onChange}
        />
        {showVisibilityToggle && (
          <button
            type="button"
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? "text-neutral-500 hover:text-white" : "text-neutral-600 hover:text-neutral-800"
            }`}
            onClick={onToggleVisibility}
          >
            {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && <p className={`mt-1 text-sm ${isDarkMode ? "text-red-400" : "text-red-500"}`}>{error}</p>}
    </div>
  )
}
