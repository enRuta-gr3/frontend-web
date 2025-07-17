import { create } from "zustand";
import { persist } from "zustand/middleware";



const EXPIRATION_TIME = 3 * 60 * 1000; // 3 minutos en milisegundos

const initialState = {
  selectedTripIda: null,
  selectedSeatsIda: [],
  selectedTripVuelta: null,
  selectedSeatsVuelta: [],
  passengers: [],
  paymentMethod: null,
  saleStatus: "pendiente",
  lastUpdate: null,
};

const useSaleStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedTripIda: (trip) =>
        set({ selectedTripIda: trip, lastUpdate: Date.now() }),
      setSelectedSeatsIda: (seats) =>
        set({ selectedSeatsIda: seats, lastUpdate: Date.now() }),
      setSelectedTripVuelta: (trip) =>
        set({ selectedTripVuelta: trip, lastUpdate: Date.now() }),
      setSelectedSeatsVuelta: (seats) =>
        set({ selectedSeatsVuelta: seats, lastUpdate: Date.now() }),
      setPassengers: (passengers) =>
        set({ passengers, lastUpdate: Date.now() }),
      setPaymentMethod: (method) =>
        set({ paymentMethod: method, lastUpdate: Date.now() }),
      setSaleStatus: (status) =>
        set({ saleStatus: status, lastUpdate: Date.now() }),
      resetSale: () => set({ ...initialState, lastUpdate: null }),
    }),
    {
      name: "sale-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({
        selectedTripIda: state.selectedTripIda,
        selectedSeatsIda: state.selectedSeatsIda,
        selectedTripVuelta: state.selectedTripVuelta,
        selectedSeatsVuelta: state.selectedSeatsVuelta,
        passengers: state.passengers,
        paymentMethod: state.paymentMethod,
        saleStatus: state.saleStatus,
        lastUpdate: state.lastUpdate,
      }),
      // Rehidratación con control de expiración 
      onRehydrateStorage: () => (state, error) => {
        if (state && state.lastUpdate) {
          const now = Date.now();
          if (now - state.lastUpdate > EXPIRATION_TIME) {
            Object.assign(state, { ...initialState, lastUpdate: null });
          }
        }
      },
    }
  )
);

export default useSaleStore;