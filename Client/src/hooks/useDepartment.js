import { useState, useEffect } from "react"
import { getDepartments } from '@/services'

const useDepartments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadDepartments = async () => {
    setLoading(true)
    try {
      const data = await getDepartments()
      console.log("[useDepartment - loadDepartment]✅ Departamentos cargados correctamente:", data)
      setDepartments(data)
    } catch (err) {
      setError("[useDepartment - loadDepartment]❌ No se pudieron cargar los departamentos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  return {
    departments,
    loading,
    error,
  }
}

export default useDepartments