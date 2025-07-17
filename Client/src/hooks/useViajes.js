import { useState, useEffect } from "react";
import { getViajes, createNewViaje } from "@/services";
import useViajeStore from "@/store/useViajesStore"; // si usás Zustand
// 
const useViajes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { viajes, setViajes, clearViajes } = useViajeStore();

  const loadViajes = async (force = false) => {
   
    setLoading(true);
    setError(null);

    try {
      const response = await getViajes();
      
      const sorted = [...(response?.data || [])].sort((a, b) => a.id_viaje - b.id_viaje)
      
      setViajes(sorted)
    } catch (err) {
      console.error("❌ Error al cargar viajes:", err);
      setError("No se pudieron cargar las viajes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateViaje = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createNewViaje(formData);
      if (res?.data?.id_viaje) {
        await loadViajes(true);
      }
      return res;
    } catch (err) {
      const msg = err.message || "No se pudo crear el viaje.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadViajes();
  }, []);

  return {
    viajes,
    loading,
    error,
    loadViajes,
    handleCreateViaje,
  };
};

export default useViajes;