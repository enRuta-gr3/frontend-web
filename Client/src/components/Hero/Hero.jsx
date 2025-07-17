import {
  Bus,
  Shield,
  CreditCard,
  Clock,
} from "lucide-react"
import {
  TripSearchForm
} from "@/components"

import useThemeStore from "@/store/useThemeStore"


export default function Hero() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode)
  return (
    <section className="relative min-h-screen pt-20 flex items-center overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute inset-0 bg-gradient-to-b ${
            isDarkMode ? "from-black/90 via-black/70 to-black/90" : "from-white/80 via-white/70 to-white/80"
          } z-10`}
        />
        <img
          src="./bus2.webp"
          alt="En Ruta - Viajes en autobús"
          className={`w-full h-full object-cover ${isDarkMode ? "opacity-60" : "opacity-40"}`}
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1
              className={`text-5xl md:text-6xl lg:text-7xl font-bold ${
                isDarkMode ? "text-white" : "text-neutral-800"
              } mb-6`}
            >
              Tu viaje <span className="text-orange-500">comienza aquí</span>
            </h1>
            <p className={`text-xl ${isDarkMode ? "text-neutral-300" : "text-neutral-600"} max-w-2xl mx-auto`}>
              Encuentra los mejores pasajes de autobús para  todo el país.
            </p>
          </div>

         {/* Formulario de busqueda de viajes */}
        <TripSearchForm
          onSubmit={()=> {}} // panel principal no se necesita
        />

          {/* info */}
          <div className="flex flex-wrap justify-center mt-12 gap-4">
            <div className={`flex items-center ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              {/* <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                <Bus className="h-5 w-5 text-orange-500" />
              </div>
              <span>+500 destinos</span> */}
            </div>
            <div className={`flex items-center ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-orange-500" />
              </div>
              <span>Viajes seguros</span>
            </div>
            <div className={`flex items-center ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                <CreditCard className="h-5 w-5 text-orange-500" />
              </div>
              <span>Pagos seguros</span>
            </div>
            <div className={`flex items-center ${isDarkMode ? "text-white" : "text-neutral-800"}`}>
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <span>24/7 Soporte</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
