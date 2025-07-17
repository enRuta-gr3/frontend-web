import { X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui"
import useThemeStore from "@/store/useThemeStore"

export default function BulkUploadForm1({
  title = "Carga Masiva",
  submitText = "Procesar archivo",
  cancelText = "Cancelar",
  description = "",
  accept = ".csv",
  templateLink = "#",
  templateText = "Descargar plantilla",
  templateConfig = null, 
  onClose,
  onUpload,
  isDarkMode,
  children,  // usamos prop children para customizar el componente de forma dinamica
}) {
  const theme = useThemeStore((state) => state.isDarkMode)
  const dark = isDarkMode ?? theme

  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setSelectedFile(file)
    console.log("📂 Archivo seleccionado en modal:", file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (onUpload && selectedFile) {
      console.log("📤 [BulkUploadForm1] Enviando archivo:", selectedFile.name)

      try {
        setIsUploading(true)
        const result = await onUpload(selectedFile)
        console.log("📋 [BulkUploadForm1] Resultado:", result)

        // Solo cerrar el modal si fue exitoso
        if (result === true || result?.success === true) {
          console.log("✅ [BulkUploadForm1] Cerrando modal por éxito")
          // El modal se cerrará desde el componente padre
        }
      } catch (error) {
        console.error("❌ [BulkUploadForm1] Error en submit:", error)
      } finally {
        setIsUploading(false)
      }
    } else {
      console.warn("⚠️ [BulkUploadForm1] No hay archivo seleccionado o callback")
    }
  }

  // const handleDownloadTemplate = (e) => {
  //   e.preventDefault()

  //   if (templateConfig) {
  //     console.log("📄 [BulkUploadForm1] Descargando plantilla:", templateConfig)
  //     generateAndDownloadTemplatePDF(templateConfig)
  //   } else {
  //     console.warn("⚠️ [BulkUploadForm1] No hay configuración de plantilla")
  //   }
  // }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`relative w-full max-w-md p-6 rounded-lg shadow-lg ${dark ? "bg-neutral-900" : "bg-white"}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${dark ? "text-white" : "text-neutral-900"}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full cursor-pointer ${dark ? "hover:bg-neutral-800" : "hover:bg-neutral-100"}`}
            disabled={isUploading}
          >
            <X className={`h-5 w-5  ${dark ? "text-neutral-400" : "text-neutral-500"}`} />
          </button>
        </div>
        {description && (
          <p className={`mb-4 text-sm ${dark ? "text-neutral-300" : "text-neutral-700"}`}>{description}</p>
        )}
        <form onSubmit={handleSubmit}>
          {children ? (
            children
          ) : (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${dark ? "text-neutral-300" : "text-neutral-700"}`}>
                  Archivo
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                    dark ? "border-neutral-700" : "border-neutral-300"
                  }`}
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className={`mx-auto h-12 w-12 ${dark ? "text-neutral-500" : "text-neutral-400"}`}
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-center justify-center">
                      <label
                        htmlFor="file-upload"
                        className={`relative cursor-pointer rounded-md font-medium ${
                          dark ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"
                        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span>Subir archivo</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept={accept}
                          className="sr-only"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    <p className={`text-xs ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
                      {accept.toUpperCase()} requerido
                    </p>
                    {selectedFile && (
                      <p className={`mt-2 text-sm ${dark ? "text-neutral-300" : "text-neutral-700"}`}>
                        📄 {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* <div className="mt-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className={`text-sm cursor-pointer ${
                    dark ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"
                  }`}
                >
                  {templateText}
                </button>
              </div> */}
            </div>
          )}
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className={`cursor-pointer ${
                dark ? "border-neutral-700 text-neutral-300" : "border-neutral-300 text-neutral-700"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              className={`bg-orange-500 hover:bg-orange-600 text-white cursor-pointer ${
                !selectedFile || isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                submitText
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
