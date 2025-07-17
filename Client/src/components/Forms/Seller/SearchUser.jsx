import { Search,AlertCircle,User } from "lucide-react";
import { Button } from "@/components"
// componente para buscar al usuario 



const SearchUserComponent = ({setCedula,cedula,cedulaError,setCedulaError,isDarkMode,handleVerifyCustomer,handleRegisterCustomer,loading}) => {

    return (
        <div className="max-w-md mx-auto">
            <div className={`rounded-lg overflow-hidden border shadow-sm ${
              isDarkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            }`}>
              <div className="p-6">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                  Ingrese cédula del cliente
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      id="customerCedula"
                      name="cedula"
                      placeholder="Ingrese la cédula del cliente"
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                      className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        isDarkMode
                          ? "bg-neutral-800 border-neutral-700 text-white"
                          : "bg-white border-neutral-300 text-neutral-900"
                      }`}
                    />
                    {cedulaError && (
                      <div className="flex items-center mt-2 text-red-500">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">{cedulaError}</span>
                      </div>
                    )}
                  </div>

                  {cedulaError === "La cédula no existe." && (
                    <div className={`p-4 rounded-lg ${isDarkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
                      <p className={`mb-3 ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`}>
                        El cliente no existe en el sistema. ¿Desea registrarlo?
                      </p>
                      <div className="flex space-x-2">
                        <Button onClick={handleRegisterCustomer} className="bg-orange-500 hover:bg-orange-600 text-white">
                          <User className="h-4 w-4 mr-2" />
                          Registrar Cliente
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCedulaError("")}
                          className={isDarkMode ? "border-neutral-700 text-neutral-300" : ""}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white w-full"
                    onClick={handleVerifyCustomer}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Buscar
                  </Button>
                </div>
              </div>
            </div>
          </div>
    )
}

export default SearchUserComponent;