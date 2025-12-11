export type Flight = {
  id_flight: number;
  route_code: string;
  airline: {
    name: string;
    iata_code: string;
  };
  sections: {
    section: {
      code_departure_airport: string;
      code_arrival_airport: string;
    };
  }[];
  scheduled_departure_day: string;
  scheduled_arrival_day: string;
  base_price: number;
};
