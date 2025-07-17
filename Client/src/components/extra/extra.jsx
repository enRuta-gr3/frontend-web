import { Button } from "@/components"
import { Download, Check } from "lucide-react"
import logo from "@/assets/logo.webp"
import useThemeStore from "@/store/useThemeStore";

export default function CTA() {
  const benefits = [
    "Gestión de reservas",
    "Notificaciones de viaje",
    "Historial de viajes",
  ];

  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  // Colores dinámicos
  const headingColor = isDarkMode ? "text-white" : "text-black";
  const textColor = isDarkMode ? "text-neutral-300" : "text-neutral-600";
  const badgeBg = "bg-orange-500/20";
  const badgeText = "text-orange-400";
  const listBg = "bg-orange-500/20";
  const listIcon = "text-orange-500";
  const bgColor = isDarkMode ? "bg-neutral-900" : "bg-white";
  const cardBg = isDarkMode ? "bg-neutral-800" : "bg-neutral-100";
  const glowEffect = "bg-orange-500/20";

  return (
    <section className={`py-24 ${bgColor}`}>
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className={`inline-block px-4 py-1 rounded-full ${badgeBg} ${badgeText} text-sm font-medium mb-4`}>
              Aplicación móvil
            </span>

            <h2 className={`text-4xl font-bold mb-6 ${headingColor}`}>
              Descarga nuestra app y <span className="text-orange-500">lleva tus viajes contigo</span>
            </h2>

            <p className={`${textColor} text-lg mb-8`}>
              Accede a promociones exclusivas, gestiona tus reservas y recibe notificaciones sobre tus viajes
              directamente en tu teléfono.
            </p>

            <ul className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <div className={`h-6 w-6 rounded-full ${listBg} flex items-center justify-center mr-3 mt-0.5`}>
                    <Check className={`h-3.5 w-3.5 ${listIcon}`} />
                  </div>
                  <span className={textColor}>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/appEnruta01.apk" download>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer">
                  <Download className="h-5 w-5 mr-2" />
                  Descargar APK
                </Button>
              </a>
            </div>
          </div>

          <div className="relative">
            
            <div className={`absolute -top-10 -left-10 h-64 w-64 ${glowEffect} rounded-full filter blur-3xl`} />
            <div className={`absolute -bottom-10 -right-10 h-64 w-64 ${glowEffect} rounded-full filter blur-3xl`} />

           
            <div className={`relative ${cardBg} rounded-3xl p-4 shadow-xl overflow-hidden`}>
              <img src={logo} alt="EnRuta" className="w-300 h-full rounded-2xl object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}