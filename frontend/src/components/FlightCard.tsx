"use client";

import { Flight } from "@/types/flight";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function FlightCard({ flight, onSelect, isReturnFlight }: { flight: Flight, onSelect: (flight: Flight) => void, isReturnFlight: boolean }) {
  const router = useRouter();

  const handleBookNow = () => {
    onSelect(flight);
  };

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold">{flight.route_code}</h2>
      <p>
        {flight.airline.name} ({flight.airline.iata_code})
      </p>
      {flight.sections.map((section, index) => (
        <p key={index}>
          {section.section.code_departure_airport} -{" "}
          {section.section.code_arrival_airport}
        </p>
      ))}
      <p>Departure: {flight.scheduled_departure_day}</p>
      <p>Arrival: {flight.scheduled_arrival_day}</p>
      <p>Price: ${flight.base_price}</p>
      <Button onClick={handleBookNow}>
        {isReturnFlight ? "Select Return Flight" : "Book Now"}
      </Button>
    </div>
  );
}
