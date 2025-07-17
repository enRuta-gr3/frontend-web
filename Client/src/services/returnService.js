import API from './api'


/**
 * Servicio encargado de las devoluciones de pasajes
 * 
 * @namespace returnService
 * 
 */


/**
 * 
 * @param {ids_pasajes} => lista con los id de los pasajes [id_pasaje,id_pasaje,...]
 */
export const returnTicket = async (ids_pasajes) => {
    try {
      //console.log("Array de pasajes => ", ids_pasajes);
      const formattedPasajes = ids_pasajes.map((id) => ({ id_pasaje: id }));
  
      const response = await API.post('/vendedor/devolverPasajes', formattedPasajes);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data.message);
    }
  };

