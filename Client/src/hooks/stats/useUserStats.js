import { useState, useCallback } from "react"
import { getNumberOfUsers, getActivityOfUsers, getAverageUserExpenditure } from "@/services";

export default function useUserStats() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cantidadUsuarios, setCantidadUsuarios] = useState(null)
  const [actividadUsuarios, setActividadUsuarios] = useState(null)
  const [promedioCompras, setPromedioCompras] = useState(null);

  const fetchCantidadUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getNumberOfUsers()
      setCantidadUsuarios(data)
      console.log(data);
      return data
    } catch (err) {
      console.error("❌ [useUserStats] Error al obtener cantidad de usuarios:", err)
      const errorMessage = err.message || "Error al obtener cantidad de usuarios"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchActividadUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getActivityOfUsers()
      setActividadUsuarios(data)
      return data
    } catch (err) {
      console.error("❌ [useUserStats] Error al obtener actividad de usuarios:", err)
      const errorMessage = err.message || "Error al obtener actividad de usuarios"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])
  
  const fetchPromedioCompras = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAverageUserExpenditure();
      setPromedioCompras(data);
      console.log("Promedio de compras:", data);
      return data;
    } catch (err) {
      console.error("❌ [useUserStats] Error al obtener promedio de compras:", err);
      const errorMessage = err.message || "Error al obtener promedio de compras";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAllStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [cant, act, avg] = await Promise.all([
        fetchCantidadUsuarios(),
        fetchActividadUsuarios(),
        fetchPromedioCompras()
      ]);
      console.log("REFRESH: ", { cantidadUsuarios: cant, actividadUsuarios: act, promedioCompras: avg });
      return { cantidadUsuarios: cant, actividadUsuarios: act, promedioCompras: avg };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchCantidadUsuarios, fetchActividadUsuarios, fetchPromedioCompras]);


  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    cantidadUsuarios,
    actividadUsuarios,
    promedioCompras,
    fetchCantidadUsuarios,
    fetchActividadUsuarios,
    fetchPromedioCompras,
    refreshAllStats,
    clearError,
  }
}
