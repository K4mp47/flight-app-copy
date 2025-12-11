"use client";

import { Seat } from "@/types/seat";
import { Button } from "./ui/button";

const SeatComponent = ({ seat, isSelected, onSelect, isDisabled }) => (
  <Button
    variant={isSelected ? "default" : "outline"}
    onClick={() => onSelect(seat.id_cell)}
    className="w-12 h-12 m-1"
    disabled={isDisabled || !seat.is_seat}
    style={{ gridColumn: seat.x + 1, gridRow: seat.y + 1 }}
  >
    {seat.is_seat ? seat.id_cell : ""}
  </Button>
);

export default function SeatMap({
  seatMap,
  selectedSeats,
  occupiedSeats,
  onSeatSelect,
}) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${seatMap.cols}, 1fr)` }}>
      {seatMap.cells.map((seat) => (
        <SeatComponent
          key={seat.id_cell}
          seat={seat}
          isSelected={selectedSeats.includes(seat.id_cell)}
          onSelect={onSeatSelect}
          isDisabled={occupiedSeats.includes(seat.id_cell)}
        />
      ))}
    </div>
  );
}
