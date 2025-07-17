
import API from "./api";

/**
 * Servicios para manejar la autenticación de usuarios (Clientes).
 * @namespace authService
 */

/**
 * Registro de un nuevo usuario (Cliente). 
 * @function
 * @async
 * @param {Object} userData - Datos del usuario a registrar.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await register({ nombre: "Juan", apellido: "Pérez", email: "test@test.com", contraseña: "123456" });
 */
export const register = async (userData) => {
    try{
        const response = await API.post("/auth/registrarUsuario", userData);
        return response;
    }catch(error){
        throw error;
    }
}

/**
 * Inicio de sesión con un usuario existente.
 * @function
 * @async
 * @param {Object} userData - Credenciales del usuario.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await login({ email: "test@test.com", contraseña: "123456" });
 * 
 * {
 *  usuario: {
 * 
 *           },
 *  access_token: "....."
 * }
 */
export const login = async (userData) => {
    try{
        const response = await API.post("/auth/iniciarSesion", userData);
        return response;
    }catch(error){
        throw error
    }
}





/**
 * Cierre de sesión de un usuario.
 * @function
 * @async
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await logout();
 * 
 * POST
        /api/usuarios/cerrarSesion?uuidAuth=[uuidAuth]&token=[token]

reemplazar 
	[uuidAuth] por el uuidAuth del usuario.
	[token] por el token de la sesion.
{
  "success": true,
  "message": "Sesión cerrada correctamente",
  "errorCode": null,
  "data": "Sesión cerrada correctamente"
}
 */
export const logout = async (uuidAuth,token) => {
    try{
        const response = await API.post(`/usuarios/cerrarSesion?uuidAuth=${uuidAuth}&token=${token}`);
        return response;
    }catch(error){
        console.log(error);
        throw error
    }
}

/**
 * Recuperación de contraseña.
 * @function
 * @async
 * @param {String} email - Email del usuario.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await recoverPassword("test@test.com");
 */
export const recoverPassword = async (email) => {
    console.log(`->>Email: '${email}'`);
    try {
        const response = await API.post("/usuarios/solicitar-recuperacion", { email }); // 👈 CORRECTO: JSON
        return response;
    } catch (error) {
        throw error
    } 
}

/**
 * Confirmacion de cambio de contraseña.
 * @function
 * @async
 * @param {String} email - Email del usuario.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await recoverPassword("test@test.com");
 */
export const confirmarRecuperacion = async (token, nuevaPassword) => {
    try {
        const response = await API.post("/usuarios/confirmar-recuperacion", {
        token,
        nuevaPassword,
        });
        return response;
    } catch (error) {
        throw error
    }
};


export const modificarPerfil = async (userData) => {
    try{
        const response = await API.post("/usuarios/modificarPerfil", userData);
        return response;
    }catch(error){
        throw error
    }
}

export const cambiarContraseña = async (userData) => {
    try{
        const response = await API.post("/usuarios/cambiarContraseña", userData);
        return response;
    }catch(error){
        throw error
    }
}