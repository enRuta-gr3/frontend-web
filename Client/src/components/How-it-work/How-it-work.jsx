import { useEffect, useRef } from "react"
import { Search, CreditCard, Bus, MapPin, Star } from "lucide-react"

import useThemeStore from "@/store/useThemeStore";




export default function HowItWorks() {
  const canvasRef = useRef(null)
  const isDarkMode = useThemeStore((state) => state.isDarkMode)

  const steps = [
    {
      icon: <Search className="h-10 w-10 text-white" />,
      title: "Busca tu ruta",
      description: "Ingresa tu origen, destino y fecha de viaje para encontrar todas las opciones disponibles.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-white" />,
      title: "Reserva y paga",
      description: "Selecciona el viaje que mejor se adapte a tus necesidades y completa tu pago de forma segura.",
    },
    {
      icon: <Bus className="h-10 w-10 text-white" />,
      title: "¡Viaja!",
      description: "Recibe tu boleto digital y preséntalo al abordar. ¡Disfruta tu viaje!",
    },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === "undefined") return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    setCanvasSize()

    let stars = []
    const createStars = () => {
      stars = []
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          opacity: Math.random(),
        })
      }
    }

    createStars()

    const roadPoints = []
    const roadWidth = canvas.width * 0.1
    const amplitude = canvas.height * 0.1
    const frequency = 0.01

    for (let x = 0; x < canvas.width; x += 5) {
      const y = canvas.height / 2 + Math.sin(x * frequency) * amplitude
      roadPoints.push({ x, y })
    }

    let busPosition = -50
    let animationId

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()
      })

      ctx.beginPath()
      ctx.moveTo(roadPoints[0].x, roadPoints[0].y - roadWidth / 2)
      for (let i = 0; i < roadPoints.length; i++) {
        ctx.lineTo(roadPoints[i].x, roadPoints[i].y - roadWidth / 2)
      }
      for (let i = roadPoints.length - 1; i >= 0; i--) {
        ctx.lineTo(roadPoints[i].x, roadPoints[i].y + roadWidth / 2)
      }
      ctx.closePath()
      ctx.fillStyle = "#262626" // color de carretera
      ctx.fill()

      for (let i = 0; i < canvas.width; i += 40) {
        const x = i
        const y = canvas.height / 2 + Math.sin(x * frequency) * amplitude
        ctx.beginPath()
        ctx.rect(x, y - 1, 20, 2)
        ctx.fillStyle = "#ffffff" // color de las lineas de la carretera
        ctx.fill()
      }

      busPosition += 3
      if (busPosition > canvas.width + 50) busPosition = -50
      const busX = busPosition
      const busY = canvas.height / 2 + Math.sin(busX * frequency) * amplitude

      ctx.beginPath()
      ctx.ellipse(busX, busY + 10, 20, 5, 0, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.fill()

      ctx.beginPath()
      ctx.roundRect(busX - 25, busY - 15, 50, 20, 5)
      ctx.fillStyle = "#f97316" // color del bondi
      ctx.fill()

      ctx.beginPath()
      ctx.rect(busX - 15, busY - 10, 30, 7)
      ctx.fillStyle = "#111" // color de ventanas
      ctx.fill()

      ctx.beginPath()
      ctx.arc(busX - 15, busY + 7, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#111"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(busX + 15, busY + 7, 5, 0, Math.PI * 2)
      ctx.fillStyle = "#111" // color  de ruedas
      ctx.fill()

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize()
      createStars()
    })

    resizeObserver.observe(canvas)

    return () => {
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <section className={`min-h-screen py-24 overflow-hidden transition-colors duration-500 ${
      isDarkMode ? "bg-neutral-900" : "bg-neutral-100"
    }`}>
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4
            ${isDarkMode ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"}`}>
            Tu viaje en 3 simples pasos
          </span>
          <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
            <span className="text-orange-500">¿Cómo funciona?</span>
          </h2>
          <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"} text-lg`}>
            Reservar tu próximo viaje en autobús nunca ha sido tan fácil. Sigue estos simples pasos:
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="relative h-64 mb-20">
            <canvas ref={canvasRef} className="block absolute inset-0 w-full h-full"></canvas>

            <div className="absolute bottom-0 left-0 h-20 w-full opacity-30">
              {["left", "right"].map((side) => (
                [10, 20, 32, 48].map((offset, i) => (
                  <div
                    key={`${side}-${offset}-${i}`}
                    className={`absolute ${side}-${offset} bottom-0 h-${[16, 20, 12, 16][i]} w-${[8, 10, 14, 6][i]} ${isDarkMode ? "bg-neutral-700" : "bg-neutral-300"}`}
                  ></div>
                ))
              ))}
            </div>

            <div className="absolute bottom-1/2 left-0 transform translate-y-1/2 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center mb-2">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-800"}`}>Inicio</div>
            </div>

            <div className="absolute bottom-1/2 right-0 transform translate-y-1/2 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className={`font-medium ${isDarkMode ? "text-white" : "text-neutral-800"}`}>Destino</div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex-1 px-4 mb-10 md:mb-0">
                <div className="relative">
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                      <div className="relative z-10 h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-xl p-8 border transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10
                    ${isDarkMode 
                      ? "bg-neutral-900 border-neutral-800" 
                      : "bg-neutral-100  border-neutral-300"}`}>
                    <div className="flex flex-col items-center text-center">
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 mb-6">
                        {step.icon}
                      </div>
                      <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? "text-white" : "text-neutral-900"}`}>
                        {step.title}
                      </h3>
                      <p className={`${isDarkMode ? "text-neutral-400" : "text-neutral-600"}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}