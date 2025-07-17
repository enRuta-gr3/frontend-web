import { login, logout, recoverPassword } from "@/services";
import { handleServiceCall } from "@/lib/adapterUtils";

/**
 * Adaptador para servicios de autenticación de cuentas internas (ADMIN - VENDEDOR).
 * 
 * Este adaptador centraliza las llamadas a los servicios de autenticación para usuarios internos de la empresa,
 * como administradores y vendedores. Permite iniciar sesión, cerrar sesión y recuperar contraseña para cuentas internas.
 * 
 * Métodos:
 * - internalLogin(userData): Inicia sesión para cuentas internas (admin/vendedor) con las credenciales proporcionadas.
 * - internalLogout(): Cierra la sesión de la cuenta interna actual.
 * - internalRecoverPassword(email): Envía un correo para recuperación de contraseña de cuentas internas.
 * 
 *
 * 
 * @namespace internalAuthAdapter
 */

export const internalAuthAdapter = {
    internalLogin: (userData) => handleServiceCall(login, userData),
    internalLogout: () => handleServiceCall(logout),
    internalRecoverPassword: (email) => handleServiceCall(recoverPassword, email),
}