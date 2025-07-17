import API from "./api";



/**
 * Servicios para manejar la autenticación de usuarios internos (admin/vendedor).
 * @namespace internalAuthService
 */



/**
 * Inicio de sesión con un usuario interno (admin/vendedor).
 * @function
 * @async
 * @param {Object} userData - Credenciales del usuario.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await adminSellerLogin({ email: "admin@test.com", contraseña: "admin123" });
 */
export const adminSellerLogin = async (userData) => {
    try{
        const response = await API.post("/auth/login", userData);
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

/**
 * Cierre de sesión de un usuario interno (admin/vendedor).
 * @function
 * @async
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await adminSellerLogout();
 */
export const adminSellerLogout = async () => {
    try{
        const response = await API.get("/auth/logout");
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}

/**
 * Recuperación de contraseña para usuarios internos.
 * @function
 * @async
 * @param {String} email - Email del usuario.
 * @returns {Promise<Object>} Respuesta del servidor.
 * @throws {Error} Si ocurre un error en la petición.
 * @example
 * await internalRecoverPassword("admin@test.com");
 */
export const internalRecoverPassword = async (email) => {
    try{
        const response = await API.post("/auth/recuperar-contraseña", email);
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}