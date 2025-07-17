import API from './api'


// servicio encargado de cargar los archivos CSV
/**
 * 
 * response {
 *  "success": boolean,
 *   "message": String,
 *    "errorCode": null,
 *      "data": "filePath"
 * }
 */
export const uploadCSVFile = async (csvFile) => {
    try{

        const formData = new FormData();
        formData.append("file", csvFile);

        const res = await API.post("/cargasMasivas/cargarArchivo", formData ,{
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });
        return res.data
    }catch(err){
        console.error("❌Error al cargar el fichero:  ",err);
        throw err;
    }

}