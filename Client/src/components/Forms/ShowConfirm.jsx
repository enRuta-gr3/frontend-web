import React from "react";

export default function ShowConfirm({
  open,
  title = "¿Desea confirmar la acción?",
  data = [],
  onAccept,
  onCancel,
  acceptText = "Aceptar",
  cancelText = "Cancelar",
  isDarkMode = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`rounded-xl p-8 max-w-md w-full shadow-xl ${isDarkMode ? "bg-neutral-800" : "bg-white"}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
          {title}
        </h3>
        <div className={`mb-4 text-sm ${isDarkMode ? "text-neutral-200" : "text-neutral-700"}`}>
          {data.map((item, idx) => (
            <div key={idx}>
              <b>{item.label}:</b> {item.value}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="bg-white border border-neutral-300 text-neutral-800 px-6 py-2 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            onClick={onAccept}
          >
            {acceptText}
          </button>
        </div>
      </div>
    </div>
  );
}