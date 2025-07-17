import {useState,useCallback} from 'react'
import { getTicketsBySale, returnTicket } from "@/services"



export default function useReturns(){
    const [tickets, setTickets ] = useState([])
    const [loading, setLoading ] = useState(false)
    const [error, setError ] = useState(null)

    // funcion para buscar pasajes por ID de venta
    const searchTicketsBySale = useCallback(async (id_venta) => {
        if(!id_venta){
            setError("Id de venta es requerido.")
            return []
        }
        
        setLoading(true)
        setError(null)

        try{
            console.log("Buscando pasajes para venta: ",id_venta)
            
            const response = await getTicketsBySale(id_venta)
            
            console.log("Respuesta del backend => ",JSON.stringify(response,null,2))

            if(response?.success && Array.isArray(response.data)){
                setTickets(response.data)
                return response.data
            }else{
                console.error("Formato de respuest invalido: ",response.message)
                setError(response.message || "No se encontraron pasajes para esta venta")
                setTickets([])
                return []
            }

        }catch(err){
            console.error("Error al buscar pasaje: ",err)
            const backendMessage = err.response?.data?.message
            setError(backendMessage || "Error al buscar pasajes")
            return []
        }finally{
            setLoading(false)
        }

    },[])

    // funcion para procesar la devolucion de pasajes
    const processReturn = useCallback(async (ids_pasajes)=>{
        if(!Array.isArray(ids_pasajes) || ids_pasajes.length === 0) 
            throw new Error("Se require al menos un para para devolver")

        setLoading(true)
        setError(null)

        try{
            console.log("Procesando devolución de pasajes:", ids_pasajes)
            
            const response = await returnTicket(ids_pasajes)
            
            if(response?.success){
                console.log("Devolucion exitosa => ", response.message)

                setTickets((prevTickets)=> 
                    prevTickets.filter((ticket) =>
                    !ids_pasajes.includes(ticket.ids_pasajes)))

                return {
                    success: true,
                    message: response.message || "Devolución completada con éxito.",
                    data: response.data
                }
            }

        }catch(err){
            console.error("❌ [useReturns] Error al devolver pasajes:", err)
            setError(err.message || "Error al procesar la devolución")

            return  {
                success: false,
                message: err.message || "Error al procesar la devolución",
                data: null

            }
        }finally{
            setLoading(false)
        }
    },[])




    // funcion para limpiar el estado
    const clearTickets = useCallback(()=> {
        setTickets([])
        setError(null)
    },[])


    // funcion para validar si un pasaje puede ser devuelto
    // menos de 1 hora para la partida
    // función para validar si un pasaje puede ser devuelto
// solo si falta al menos 1 hora
    const canReturnTicket = useCallback((ticket) => {
        if (!ticket?.viaje) return false;
    
        try {
        const now = new Date();
    
        // Formatear fecha correctamente desde "DD/MM/YYYY"
        const [day, month, year] = ticket.viaje.fecha_partida.split("/");
        const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    
        // Construir fecha y hora de partida combinada
        const departureDateTime = new Date(`${formattedDate}T${ticket.viaje.hora_partida}`);
    
        const timeDifference = departureDateTime.getTime() - now.getTime();
        const hoursDifference = timeDifference / (1000 * 60 * 60); // en horas
    
        return hoursDifference >= 1;
        } catch (err) {
        console.error("Error al validar tiempo de devolución:", err);
        return false;
        }
    }, []);


    return {
        tickets,
        loading,
        error,
        searchTicketsBySale,
        processReturn,
        clearTickets,
        canReturnTicket
    }
}