
import { useState } from "react";
import { authAdapter } from "@/adapters"
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import { handleAuthErrors } from "../lib/authUtils";


const useInternalLogin = () => {

    /**
     * Estado que indica si la petición de login está en curso.
     * Útil para mostrar spinners o deshabilitar botones mientras se procesa el login.
     */
    const [loading, setLoading] = useState(false);

    /**
     * Estado que almacena el mensaje de error si ocurre alguno durante el login.
     * Puede ser mostrado en la interfaz para informar al usuario.
     */
    const [error, setError] = useState(null);

    /**
     * Función del store global para guardar los datos del usuario autenticado y el token.
     * Permite que el usuario permanezca autenticado en toda la aplicación.
     */
    const { login: storeLogin } = useAuthStore();

    /**
     * Hook de React Router para redireccionar al usuario tras el login.
     */
    const navigate = useNavigate();

    
    

    
    const handleLogin = async ({email , contraseña}) => {
        setLoading(true);
        setError(null);

        
        try{
            // enviamos las credenciales al backend con el adaptador de autenticacion interno
            const {data:responseData} = await authAdapter.login({email, contraseña});
       
            
                // guardamos los datos del usuario y el token en el store global (mantiene la sesion)
            storeLogin(responseData.usuario, responseData.access_token, responseData.usuario.tipo_usuario);
            // redireccionamos al usuario segun su rol
                if(responseData.usuario.tipo_usuario === "ADMINISTRADOR"){
                    navigate("/enRuta/admin/dashboard")
                }else if(responseData.usuario.tipo_usuario === "VENDEDOR"){
                    navigate("/enRuta/vendedor/dashboard")
                }else{
                    navigate("/enRuta/")
                }
            return responseData
        }catch(err){
            handleAuthErrors(err, setError);
        }finally{
            setLoading(false);
        }
    }

    // Retorna la función de login, el estado de carga y el error para usar en el componente
    return { handleLogin, loading, error };

}

export default useInternalLogin;



