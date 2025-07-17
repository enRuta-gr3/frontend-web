import { Check } from "lucide-react"

function FormStepsIndicator({
  currentStep,
  totalSteps,
  completedSteps = [],
  onStepClick = null,
  className = "",
  isDarkMode = false,
}) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {steps.map((stepNumber, index) => {
        const isActive = stepNumber === currentStep
        const isCompleted = completedSteps.includes(stepNumber)
        const isClickable = onStepClick && (stepNumber < currentStep || isCompleted)

        return (
          <div key={stepNumber} className="flex items-center">
            {/* Punto/círculo del paso */}
            <button
              type="button"
              onClick={isClickable ? () => onStepClick(stepNumber) : undefined}
              disabled={!isClickable}
              className={`
                relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                ${isClickable ? "cursor-pointer hover:scale-110" : "cursor-default"}
                ${
                  isActive
                    ? "bg-orange-500 text-white shadow-lg"
                    : isCompleted
                      ? isDarkMode
                        ? "bg-green-600 text-white hover:bg-green-500"
                        : "bg-green-500 text-white hover:bg-green-600"
                      : isDarkMode
                        ? "bg-white/20 text-white/60 border border-white/30"
                        : "bg-neutral-200 text-neutral-500 border border-neutral-300"
                }
                ${isClickable && !isActive ? "hover:shadow-md" : ""}
              `}
              title={
                isClickable
                  ? `Ir al paso ${stepNumber}`
                  : isCompleted
                    ? `Paso ${stepNumber} completado`
                    : `Paso ${stepNumber}`
              }
            >
              {isCompleted && stepNumber !== currentStep ? <Check className="w-4 h-4" /> : stepNumber}

              {/* Indicador de clickeable */}
              {isClickable && !isActive && (
                <div
                  className={`
                  absolute -top-1 -right-1 w-3 h-3 rounded-full 
                  ${isDarkMode ? "bg-orange-400" : "bg-orange-500"} 
                  opacity-0 group-hover:opacity-100 transition-opacity
                `}
                />
              )}
            </button>

            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-8 h-0.5 mx-1 transition-colors duration-200
                  ${
                    stepNumber < currentStep || isCompleted
                      ? "bg-orange-500"
                      : isDarkMode
                        ? "bg-white/20"
                        : "bg-neutral-300"
                  }
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default FormStepsIndicator
