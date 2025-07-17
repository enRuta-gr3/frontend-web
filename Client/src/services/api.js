import axios from "axios";


const apiUrl = 'https://backend-production-2812f.up.railway.app/api/'; // luego estara dentro de un .env

/**
 *  Configuracion de axios para la API
 *  @type {import('axios').AxiosInstance}
 */


const API = axios.create({
    baseURL: apiUrl,
    headers: { "content-type": "application/json" },
    withCredentials: true,
});


export default API;