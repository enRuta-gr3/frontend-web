//  servicios para consumir las estadisiticas del panel admin y vendedor
import API from './api';


// VENDEDOR
// Viajes por localidad (requiere año y mes)
export const getTripsByLocation = async (anio, mes) => {
    try {
        console.log("Año, mes: ", anio, mes)
        const response = await API.get(`/vendedor/viajesPorLocalidad?anio=${anio}&mes=${mes}`);
        console.log("Viajes por localidad:", response.data.data);
        return response.data.data;
    } catch (error) {
        console.error("Error al obtener viajes por localidad:", error);
        throw error;
    }
}

// Viajes por mes (requiere solo año)
export const getTripsByMonth = async (anio) => {
    try {
        const response = await API.get(`/vendedor/viajesPorMes?anio=${anio}`);
        console.log("Viajes por mes:", response.data.data);
        return response.data.data;
    } catch (error) {
        console.error("Error al obtener viajes por mes:", error);
        throw error;
    }
}

// Porcentaje de omnibus asignado
export const getAssignedOmnibusPercentage = async () => {
    try {
        const response = await API.get('/vendedor/porcentajeOmnibusAsignados');
        console.log("Estadistica omnibus:", response.data);
        return response.data;
    }catch (error) {
        console.error("❌ Error al obtener ususarios:", error)
        throw error
    }
}

// Pasajes devueltos por mes
export const getReturnedTicketsByMonth = async () => {
  try {
    const response = await API.get('/vendedor/pasajesDevueltosPorMes')
    return response.data
  } catch (error) {
    console.error("❌ Error al obtener pasajes devueltos por mes:", error)
    throw error
  }
}

// Pasajes vendidos por mes
export const getSoldTicketsByMonth = async () => {
  try {
    const response = await API.get('/vendedor/pasajesVendidosPorMes')
    console.log("Pasajes vendidos por mes:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ Error al obtener pasajes vendidos por mes:", error)
    throw error
  }
}

// Estados de omnibus por mes
export const getBusStatusByMonth = async () => {
  try {
    const response = await API.get('/vendedor/estadoOmnibusPorMes')
    console.log("Estado de omnibus por mes:", response.data)
    return response.data
  } catch (error) {
    console.error("❌ Error al obtener estados de omnibus por mes:", error)
    throw error
  }
}


// ADMIN
export const getNumberOfUsers = async () => {
    try {
        const response = await API.get('/admin/estadisticaCantidadUsuarios');
        console.log("Estadistica cantidad de ususarios:", response.data);
        return response.data;
    }catch (error) {
        console.error("❌ Error al obtener ususarios:", error)
        throw error
    }
}

export const getActivityOfUsers = async () => {
    try {
        const response = await API.get('/admin/estadisticaActividad');
        console.log("Estadistica actividad de usuarios:", response.data);
        return response.data;
    }catch (error) {
        console.error("❌ Error al obtener ususarios:", error)
        throw error
    }
}

export const getAverageUserExpenditure = async () => {
    try {
        const response = await API.get('/admin/estadisticaPromedioCompras');
        console.log("Estadistica gasto de usuarios:", response.data);
        return response.data;
    }catch (error) {
        console.error("❌ Error al obtener ususarios:", error)
        throw error
    }
}