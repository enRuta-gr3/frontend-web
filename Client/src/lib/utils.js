/**
 * Utilidades para manejo de clases CSS en componentes React usando Tailwind CSS.
 * 
 * Esta función permite combinar múltiples nombres de clases (classNames) de forma eficiente,
 * utilizando las librerías 'clsx' y 'tailwind-merge'. Es útil para condicionar estilos
 * en función de props o estados, evitando clases repetidas o conflictos.
 * 
 * Ejemplo de uso:
 *   cn("bg-red-500", condition && "text-white", "p-4")
 *   // Retorna: "bg-red-500 p-4" (si condition es falso)
 *   // Retorna: "bg-red-500 text-white p-4" (si condition es verdadero)
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina y optimiza nombres de clases de Tailwind CSS.
 * 
 * @param  {...any} inputs - Lista de nombres de clases (strings, arrays, objetos, etc).
 * @returns {string} - String final de clases optimizadas y sin repeticiones.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}