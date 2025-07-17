import { createPortal } from "react-dom"

export default function LoadingOverlay({ isActive, text, isDarkMode }) {
  if (!isActive) return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`${isDarkMode ? "bg-neutral-800 text-white" : "bg-white text-neutral-900"} rounded-xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mb-6"></div>
        <h3 className="text-lg font-semibold text-center">{text || "Procesando..."}</h3>
        <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"} text-center mt-2 text-sm`}>
          Por favor, espere un momento.
        </p>
      </div>
    </div>,
    document.body,
  )
}
