import { AlertCircle } from "lucide-react"

export default function TermsCheckbox({ checked, onChange, error, isDarkMode = true }) {
  return (
    <div className="mt-4">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className={`h-4 w-4 rounded ${
              isDarkMode ? "border-neutral-700 bg-neutral-800/50" : "border-neutral-300 bg-white/70"
            } text-orange-500 focus:ring-orange-500`}
            checked={checked}
            onChange={onChange}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="terms" className={`font-medium ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
            Acepto los{" "}
            <a href="#" className="text-orange-500 hover:text-orange-400">
              términos y condiciones
            </a>
          </label>
        </div>
      </div>
      {error && (
        <div className="flex items-center mt-1 text-sm">
          <AlertCircle className={`h-4 w-4 mr-1 ${isDarkMode ? "text-red-400" : "text-red-500"}`} />
          <span className={isDarkMode ? "text-red-400" : "text-red-500"}>{error}</span>
        </div>
      )}
    </div>
  )
}
