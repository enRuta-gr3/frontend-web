import { create } from "zustand"
import { persist } from "zustand/middleware"


const useLocalitiesStore = create(
  persist(
    (set) => ({
      localities: [],

      setLocalities: (data) => {
        const parsed = Array.isArray(data) ? data : []
        console.log("Store: Estableciendo localidades:", parsed)
        set({ localities: parsed })
      },

      updateLocality: (id, updatedLoc) =>
        set((state) => ({
          localities: state.localities.map((loc) =>
            loc.id_localidad === id
              ? {
                  ...loc,
                  ...updatedLoc,
                  departamento: {
                    ...loc.departamento,
                    ...updatedLoc.departamento,
                  },
                }
              : loc
          ),
        })),

      removeLocality: (id) =>
        set((state) => ({
          localities: state.localities.filter((loc) => loc.id_localidad !== id),
        })),

      clearLocalities: () => {
        console.log("Store: Limpiando localidades")
        set({ localities: [] })
      },
    }),
    {
      name: "localities-storage-v2", // clave en localStorage
    }
  )
)

export default useLocalitiesStore