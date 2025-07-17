// servicio relacionado a usuarios
// listar,busqueda especifica editar, dar de baja, modificar
import API from "./api"

/**
 * request: {
 *  "tipo_usuario": "CLIENTE",
 *  "ci": Number
 *  }
 *  response.data{
  "success": true,
  "message": "Usuario obtenido correctamente",
  "errorCode": null,
  "data": {
    "tipo_usuario": "CLIENTE",
    "uuidAuth": "c09ee11c-9809-4109-87dd-7050b1019fec",
    "ci": "45092234",
    "nombres": "Bibi",
    "apellidos": "Bibi",
    "email": "bfariello185@gmail.com",
    "fecha_nacimiento": "1988-05-18T03:00:00.000+00:00",
    "eliminado": false,
    "esEstudiante": false,
    "esJubilado": false,
    "estado_descuento": false
  }
}
 */
export const getUserByIDcard = async (userData) => {
  try {
    const response = await API.post("/usuarios/buscarPorCi", userData)
    return response.data
  } catch (error) { 
    throw error
  }
}


/**
 *  GET /usuarios/listarUsuarios
 * {
  "success": true,
  "message": "Usuarios listados correctamente",
  "errorCode": null,
  "data": [
    {
      "tipo_usuario": "VENDEDOR",
      "ci": "51234567",
      "nombres": "Franco Rodrgio",
      "apellidos": "Pirotto Perez",
      "email": "vendedor@enruta.com",
      "eliminado": false,
      "esEstudiante": false,
      "esJubilado": false,
      "estado_descuento": false
    },
    {
      "tipo_usuario": "CLIENTE",
      "ci": "11111111",
      "nombres": "Kim",
      "apellidos": "Jong-un",
      "email": "kimjongun@yopmail.com",
      "eliminado": false,
      "esEstudiante": false,
      "esJubilado": true,
      "estado_descuento": false
    },
    ]
 */

export const getAllUser = async () => {
  try {
    const response = await API.get("/usuarios/listarUsuarios")
    return response.data
  } catch (error) {
    throw new Error(error.response?.data.message);
  } 
}

/**
 *  DEL /admin/eliminarUsuario
 *  Authorization: String                
 *  Content-Type: application/json
 *  
 *  {
 *   "email": string
 *  }
 *  o 
 *  { 
 *    "ci": string
 *  }
 * 
 */

export const deleteUserByAdmin = async (userData, token) => {
  try {
    const response = await API.delete("/admin/eliminarUsuario",{
      headers:{
        Authorization: token
      },
      data: userData,
    })
    return response.data 
  } catch (error) {
    throw new Error(error.response?.data.message);
  } 
}


// servicio para las altas masivas de usuarios admin-vendedor 
/**
 * Response: {
  "success": true,
  "message": "Usuarios procesados correctamente.",
  "errorCode": null,
  "data": {
    "totalLineasARegistrar": 2,
    "totalLineasError": 1,
    "totalLineasOk": 1,
    "elementos": [
      {
        "tipo_usuario": "VENDEDOR",
        "uuidAuth": "8e39ae4c-eb0f-4805-bc6d-4f7fe52cc8ce",
        "ci": "49057080",
        "nombres": "Gloria",
        "apellidos": "Taberne",
        "email": "TbG@enruta.com",
        "fecha_nacimiento": "1992-04-09"
      }
    ]
  }
}
 */
export const registerInternalUser = async() => {
  try{
    const response = await API.get("/cargasMasivas/crearUsuarios");
    return response.data
  }catch(err){
    throw new Error(err.response?.data.message);
  }
}

export const validateUserBySeller = async (uuidAuth) => {
  try {
    const response = await API.post("/usuarios/verificarDescuento", {uuidAuth})
    return response.data
  } catch (error) { 
      throw new Error(error.response?.data.message);
  }
}


