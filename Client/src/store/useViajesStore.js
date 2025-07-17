import { create } from "zustand"

const useViajesStore = create((set) => ({
  viajes: [],
  setViajes: (data) => set({ viajes: data }),
  addViaje: (viaje) =>
    set((state) => ({ viajes: [...state.viajes, viaje] })),
  clearViajes: () => set({ viajes: [] })
}))

export default useViajesStore