import API from './api';


export const getDepartments = async () => {
    try {
        const response = await API.get('/departamentos/listarDepartamentos');
        return response.data.data;
    }catch (error) {
        console.error("❌ Error al obtener departamentos:", error)
        throw new Error(error.response?.data.message);
    }
}