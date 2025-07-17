import { register, login, logout,recoverPassword } from "@/services";
import { handleServiceCall } from "@/lib/adapterUtils";

/**
 * Adaptador para servicios de autenticación.
 * @namespace authAdapter
 */



/**
 * Objeto adaptador para servicios de autenticación.
 * @type {Object}
 * @property {Function} register - Funcion para registrar un usuario.
 * @property {Function} login - Funcion para iniciar sesion.
 * @property {Function} logout - Funcion para cerrar sesion.
 */

/**
 * Adaptador para servicios de autenticación de usuarios externos (clientes).
 * 
 * Este adaptador centraliza las llamadas a los servicios de autenticación para usuarios normales de la plataforma.
 * Utiliza funciones del backend para registrar, iniciar sesión, cerrar sesión y recuperar contraseña.
 * 
 * Métodos:
 * - register(userData): Registra un nuevo usuario con los datos proporcionados.
 * - login(userData): Inicia sesión con las credenciales del usuario.
 * - logout(): Cierra la sesión del usuario actual.
 * - recoverPassword(email): Envía un correo para recuperación de contraseña.
 * 
 * Ejemplo de uso:
 * 
 * import { authAdapter } from "@/adapters";
 * 
 * // Registro
 * await authAdapter.register({ nombres, apellidos, email, contraseña, ... });
 * 
 * // Login
 * await authAdapter.login({ email, contraseña });
 * 
 * // Logout
 * await authAdapter.logout();
 * 
 * // Recuperar contraseña
 * await authAdapter.recoverPassword("usuario@correo.com");
 */
export const authAdapter = {
    register:(userData) => handleServiceCall(register, userData),
    login: (userData) => handleServiceCall(login, userData),
    logout: () => handleServiceCall(logout),
    recoverPassword: (email) => handleServiceCall(recoverPassword, email),
}