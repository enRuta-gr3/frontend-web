import { Bus, Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Input, Button } from "@/components"

import useThemeStore from "../../store/useThemeStore";

export default function Footer() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  const textColor = isDarkMode ? "text-neutral-300" : "text-neutral-600";
  const headingColor = isDarkMode ? "text-white" : "text-black";
  const iconBg = isDarkMode ? "bg-neutral-800" : "bg-neutral-100";
  const hoverBg = isDarkMode ? "hover:bg-neutral-700" : "hover:bg-neutral-200";
  const borderColor = isDarkMode ? "border-neutral-700" : "border-neutral-200";
  const footerBg = isDarkMode ? "bg-neutral-900" : "bg-white";

  return (
    <footer className={`${footerBg}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className={`text-xl font-bold ${headingColor}`}>En Ruta</span>
                <p className={`text-xs ${textColor} -mt-1`}>uniendo caminos</p>
              </div>
            </Link>
            <p className={`${textColor} mb-6`}>
              Conectando destinos y personas a través de la mejor experiencia de viaje en autobús.
            </p>
            {/* <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center ${hoverBg} transition-colors`}
                >
                  <Icon className={`h-5 w-5 ${isDarkMode ? "text-neutral-300" : "text-neutral-700"}`} />
                </a>
              ))}
            </div> */}
          </div>

         

          {/* <div>
            <h3 className={`font-semibold mb-4 ${headingColor}`}>Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                <span className={textColor}>Av. Principal 123, Ciudad</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-orange-500 mr-3 mt-0.5" />
                <span className={textColor}>enruta.lat@enruta.com</span>
              </li>
            </ul>
          </div> */}

         
        </div>

        <div className={`border-t ${borderColor} mt-12 pt-8 flex flex-col md:flex-row justify-between items-center`}>
          <p className={`${textColor} text-sm`}>
            © {new Date().getFullYear()} En Ruta. Todos los derechos reservados.
          </p>
         
        </div>
      </div>
    </footer>
  )
}