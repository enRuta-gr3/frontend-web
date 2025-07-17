import { create } from 'zustand'

/**
 * GetInitialTheme
 * @description: Devuelve el tema inicial del usuario
 * @returns {boolean} : Devuelve true si el tema es dark
 * 
 * @example: getInitialTheme() => true
 */
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') === 'dark'
  }
  return false
}

/**
 * Zustand Store para el tema del usuario
 * @typedef {object} ThemeStore
 * 
 * @property {boolean} isDarkMode: Indica si el tema es dark
 * @property {function} toggleTheme: Funcion que se encarga de cambiar el tema
 *
 * @description: Hook que se encarga de manejar el tema del usuario
 * 
 * @type {import('zustand').UseBoundStore<ThemeStore>}
 * 
 * @example: const { isDarkMode, toggleTheme } = useThemeStore()
 * 
 */
const useThemeStore = create((set) => ({
  isDarkMode: getInitialTheme(),
  toggleTheme: () => {
    set((state) => {
      const newTheme = !state.isDarkMode
      
    
      document.documentElement.classList.toggle('dark', newTheme)
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      
      return { isDarkMode: newTheme }
    })
  }
}))

export default useThemeStore