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
    <div className="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary">{flight.route_code}</h2>
        <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">${flight.base_price}</div>
      </div>
      <div className="mb-4">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {flight.airline.name} ({flight.airline.iata_code})
        </p>
        <div className="mt-2">
          {flight.sections.map((section, index) => (
            <div key={index} className="flex items-center text-gray-600 dark:text-gray-400">
              <span>{section.section.code_departure_airport}</span>
              <span className="mx-2">&#8594;</span>
              <span>{section.section.code_arrival_airport}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div>
          <p className="font-semibold">Departure</p>
          <p>{new Date(flight.scheduled_departure_day).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="font-semibold">Arrival</p>
          <p>{new Date(flight.scheduled_arrival_day).toLocaleDateString()}</p>
        </div>
      </div>
      <Button onClick={handleBookNow} className="w-full">
        {isReturnFlight ? "Select Return Flight" : "Book Now"}
      </Button>
    </div>
  );
}
