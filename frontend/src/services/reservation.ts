import { api } from "@/lib/api";

export const reservationService = {
  bookFlight: async (reservationData) => {
    return await api.post("/flight/book", reservationData);
  },
  getPurchaseHistory: async () => {
    return await api.get("/users/flights");
  },
  getOccupiedSeats: async (flightId) => {
    return await api.get(`/flight/${flightId}/seats-occupied`);
  }
};
