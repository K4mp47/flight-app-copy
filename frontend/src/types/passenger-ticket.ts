import { Flight } from "./flight";

export interface Passenger {
  id_passengers: number;
  name: string;
  lastname: string;
  date_birth: string;
  phone_number: string;
  email: string;
  passport_number: string;
}

export interface Ticket {
  id_ticket: number;
  price: number;
  flight: Flight;
}

export interface PassengerTicket {
  id_buyer: number;
  id_passenger_ticket: number;
  passenger: Passenger;
  ticket: Ticket;
}
