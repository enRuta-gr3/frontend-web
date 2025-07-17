import { create } from "zustand"

const useBusStore = create((set) => ({
  buses: [],
  setBuses: (newList) => set({ buses: newList }),
  clearBuses: () => set({ buses: [] }),
}))

export default useBusStore
