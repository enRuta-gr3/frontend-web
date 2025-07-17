

import { Lock } from "lucide-react"
import FormInput from "../Elements/FormInput"
import TermsCheckbox from "../Elements/TermsCheckbox"

function Step2({
  formData,
  errors,
  handleChange,
  showPassword,
  togglePasswordVisibility,
  showConfirmPassword,
  toggleConfirmPasswordVisibility,
  isDarkMode = true,
}) {
  return (
    <div className="space-y-4">
      <FormInput
        icon={Lock}
        label="Contraseña"
        name="contraseña"
        type={showPassword ? "text" : "password"}
        value={formData.contraseña}
        error={errors.contraseña}
        onChange={handleChange}
        placeholder="••••••••"
        showVisibilityToggle
        onToggleVisibility={togglePasswordVisibility}
        isPasswordVisible={showPassword}
        isDarkMode={isDarkMode}
      />
      <FormInput
        icon={Lock}
        label="Confirmar contraseña"
        name="confirmarContraseña"
        type={showConfirmPassword ? "text" : "password"}
        value={formData.confirmarContraseña}
        error={errors.confirmarContraseña}
        onChange={handleChange}
        placeholder="••••••••"
        showVisibilityToggle
        onToggleVisibility={toggleConfirmPasswordVisibility}
        isPasswordVisible={showConfirmPassword}
        isDarkMode={isDarkMode}
      />
      {/* <TermsCheckbox checked={formData.terms} onChange={handleChange} error={errors.terms} isDarkMode={isDarkMode} /> */}
    </div>
  )
}

export default Step2
