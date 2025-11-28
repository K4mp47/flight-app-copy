"use client";
import { useEffect, useState } from "react";
import { MainNavBar } from "@/components/MainNavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { reservationService } from "@/services/reservation";
import { useAuth } from "@/hooks/useAuth";

const Seat = ({ seatNumber, isSelected, onSelect, isDisabled }) => (
  <Button
    variant={isSelected ? "default" : "outline"}
    onClick={() => onSelect(seatNumber)}
    className="w-12 h-12 m-1"
    disabled={isDisabled}
  >
    {seatNumber}
  </Button>
);

export default function ReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flightId = searchParams.get("flightId");
  const returnFlightId = searchParams.get("returnFlightId");
  const userId = useAuth();
  const [passengers, setPassengers] = useState([
    {
      name: "",
      lastname: "",
      date_birth: "",
      phone_number: "",
      email: "",
      passport_number: "",
      sex: "M",
      outboundSeatId: null,
      returnSeatId: null,
    },
  ]);
  const [outboundOccupiedSeats, setOutboundOccupiedSeats] = useState([]);
  const [returnOccupiedSeats, setReturnOccupiedSeats] = useState([]);

  useEffect(() => {
    if (flightId) {
      const fetchOccupiedSeats = async () => {
        try {
          const data = await reservationService.getOccupiedSeats(flightId);
          const seats = data.flatMap((block) => block.seats.map((seat) => seat.id_cell));
          setOutboundOccupiedSeats(seats);
        } catch (error) {
          toast.error("Failed to fetch outbound occupied seats.");
        }
      };
      fetchOccupiedSeats();
    }
    if (returnFlightId) {
      const fetchOccupiedSeats = async () => {
        try {
          const data = await reservationService.getOccupiedSeats(returnFlightId);
          const seats = data.flatMap((block) => block.seats.map((seat) => seat.id_cell));
          setReturnOccupiedSeats(seats);
        } catch (error) {
          toast.error("Failed to fetch return occupied seats.");
        }
      };
      fetchOccupiedSeats();
    }
  }, [flightId, returnFlightId]);

  const handleAddPassenger = () => {
    setPassengers([
      ...passengers,
      {
        name: "",
        lastname: "",
        date_birth: "",
        phone_number: "",
        email: "",
        passport_number: "",
        sex: "M",
        outboundSeatId: null,
        returnSeatId: null,
      },
    ]);
  };

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const handleSeatSelect = (index, seatNumber, isReturn) => {
    const newPassengers = [...passengers];
    if (isReturn) {
      newPassengers[index].returnSeatId = seatNumber;
    } else {
      newPassengers[index].outboundSeatId = seatNumber;
    }
    setPassengers(newPassengers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flightId || !userId) {
      toast.error("Missing flight information or user not logged in.");
      return;
    }

    const tickets = passengers.flatMap((p) => {
      const outboundTicket = {
        ticket_info: {
          id_flight: parseInt(flightId),
          id_seat: p.outboundSeatId,
          additional_baggage: [],
        },
        passenger_info: { ...p },
      };
      if (returnFlightId) {
        const returnTicket = {
          ticket_info: {
            id_flight: parseInt(returnFlightId),
            id_seat: p.returnSeatId,
            additional_baggage: [],
          },
          passenger_info: { ...p },
        };
        return [outboundTicket, returnTicket];
      }
      return [outboundTicket];
    });

    const reservationData = {
      id_buyer: userId,
      tickets,
    };

    try {
      await reservationService.bookFlight(reservationData);
      toast.success("Reservation successful!");
      router.push("/dashboard/purchase-history");
    } catch (error) {
      toast.error("Failed to create reservation.");
    }
  };

  const seats = Array.from({ length: 30 }, (_, i) => i + 1);
  const selectedOutboundSeats = passengers.map((p) => p.outboundSeatId);
  const selectedReturnSeats = passengers.map((p) => p.returnSeatId);

  return (
    <div className="min-h-screen">
      <MainNavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Reservation</h1>
        <form onSubmit={handleSubmit}>
          {passengers.map((passenger, index) => (
            <div key={index} className="mb-8 border p-4 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">
                Passenger {index + 1}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${index}`}>Name</Label>
                  <Input
                    id={`name-${index}`}
                    value={passenger.name}
                    onChange={(e) =>
                      handlePassengerChange(index, "name", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`lastname-${index}`}>Last Name</Label>
                  <Input
                    id={`lastname-${index}`}
                    value={passenger.lastname}
                    onChange={(e) =>
                      handlePassengerChange(index, "lastname", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`date_birth-${index}`}>Date of Birth</Label>
                  <Input
                    id={`date_birth-${index}`}
                    type="date"
                    value={passenger.date_birth}
                    onChange={(e) =>
                      handlePassengerChange(index, "date_birth", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`phone_number-${index}`}>Phone Number</Label>
                  <Input
                    id={`phone_number-${index}`}
                    value={passenger.phone_number}
                    onChange={(e) =>
                      handlePassengerChange(
                        index,
                        "phone_number",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`email-${index}`}>Email</Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={passenger.email}
                    onChange={(e) =>
                      handlePassengerChange(index, "email", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`passport_number-${index}`}>
                    Passport Number
                  </Label>
                  <Input
                    id={`passport_number-${index}`}
                    value={passenger.passport_number}
                    onChange={(e) =>
                      handlePassengerChange(
                        index,
                        "passport_number",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`sex-${index}`}>Sex</Label>
                  <select
                    id={`sex-${index}`}
                    value={passenger.sex}
                    onChange={(e) =>
                      handlePassengerChange(index, "sex", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Select Outbound Seat</h3>
                <div className="flex flex-wrap">
                  {seats.map((seatNumber) => (
                    <Seat
                      key={seatNumber}
                      seatNumber={seatNumber}
                      isSelected={passenger.outboundSeatId === seatNumber}
                      onSelect={(seat) => handleSeatSelect(index, seat, false)}
                      isDisabled={selectedOutboundSeats.includes(seatNumber) && passenger.outboundSeatId !== seatNumber || outboundOccupiedSeats.includes(seatNumber)}
                    />
                  ))}
                </div>
              </div>
              {returnFlightId && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Select Return Seat</h3>
                  <div className="flex flex-wrap">
                    {seats.map((seatNumber) => (
                      <Seat
                        key={seatNumber}
                        seatNumber={seatNumber}
                        isSelected={passenger.returnSeatId === seatNumber}
                        onSelect={(seat) => handleSeatSelect(index, seat, true)}
                        isDisabled={selectedReturnSeats.includes(seatNumber) && passenger.returnSeatId !== seatNumber || returnOccupiedSeats.includes(seatNumber)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <Button type="button" onClick={handleAddPassenger} className="mb-4">
            Add Another Passenger
          </Button>
          <Button type="submit">Confirm Reservation</Button>
        </form>
      </div>
    </div>
  );
}
