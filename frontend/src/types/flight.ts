export interface Flight {
  id_flight: number;
  id_aircraft: number;
  route_code: string;
  base_price: number;
  scheduled_departure_day: string;
  scheduled_arrival_day: string;
  airline: {
    iata_code: string;
    name: string;
  };
  sections: {
    id_airline_routes: number;
    departure_time: string;
    arrival_time: string;
    next_id: number | null;
    section: {
      id_routes_section: number;
      code_departure_airport: string;
      code_arrival_airport: string;
    };
  }[];
}
