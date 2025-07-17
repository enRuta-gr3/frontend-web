import { useState, useEffect, useCallback } from "react";
import { getUserTicketHistory } from "@/services";

const useTicketHistory = (uuidAuth) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTicketHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    const data = { uuidAuth : uuidAuth }; // Formato esperado por el backend

    try {
      const response = await getUserTicketHistory(data); // Llama al service con el cuerpo correcto
      setTickets(response.data || []); // Actualiza el estado con los datos retornados
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error al cargar pasajes.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [uuidAuth]);

  useEffect(() => {
    if (uuidAuth) loadTicketHistory(); // Carga el historial al montar el hook si uuidAuth está disponible
  }, [uuidAuth]);

  return {
    tickets, // Lista de pasajes
    loading, // Estado de carga
    error, // Mensaje de error
    loadTicketHistory, // Función para recargar el historial
  };
};

export default useTicketHistory;