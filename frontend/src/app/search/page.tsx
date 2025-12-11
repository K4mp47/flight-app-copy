"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import FlightCard from "@/components/FlightCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MainNavBar } from "@/components/MainNavBar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Flight } from "@/types/flight";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [companyuser, setCompanyuser] = useState(false);
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<Flight | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setCompanyuser(payload.role === "Airline-Admin");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        const origin = searchParams.get("origin") || "";
        const destination = searchParams.get("destination") || "";
        const departure_date = searchParams.get("departure_date") || "";
        const return_date = searchParams.get("return_date") || "";

        const query = new URLSearchParams();
        if (origin) query.append("departure_airport", origin);
        if (destination) query.append("arrival_airport", destination);
        if (departure_date) query.append("departure_date_outbound", departure_date);
        if (return_date) query.append("departure_date_return", return_date);
        query.append("round_trip_flight", return_date ? "true" : "false");
        query.append("direct_flights", "true");
        query.append("id_class", "4");

        const data = await api.get<{ outbound_flights: Flight[], return_flights: Flight[] }>(
          `/flight/search?${query.toString()}`
        );

        const sortFlights = (flights: Flight[]) => {
          return flights.sort((a, b) => {
            if (sortBy === "price") {
              return sortOrder === "asc" ? a.base_price - b.base_price : b.base_price - a.base_price;
            }
            // Add other sort conditions here
            return 0;
          });
        };

        setOutboundFlights(sortFlights(data.outbound_flights || []));
        setReturnFlights(sortFlights(data.return_flights || []));
      } catch (error: Error | unknown) {
        toast.error((error as Error).message || "Failed to fetch flights");
      }
      setLoading(false);
    };

    fetchFlights();
  }, [searchParams, sortBy, sortOrder]);

  useEffect(() => {
    if (selectedOutboundFlight) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("return_date", new Date(selectedOutboundFlight.scheduled_arrival_day).toISOString().split("T")[0]);
      router.replace(`/search?${newSearchParams.toString()}`);
    }
  }, [selectedOutboundFlight, router, searchParams]);

  const handleSelectOutboundFlight = (flight: Flight) => {
    setSelectedOutboundFlight(flight);
  };

  const handleBookReturnFlight = (returnFlight: Flight) => {
    if (selectedOutboundFlight) {
      router.push(`/reservation?flightId=${selectedOutboundFlight.id_flight}&returnFlightId=${returnFlight.id_flight}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Button
        variant="outline"
        className="fixed left-4 top-4 z-50 hover:cursor-pointer"
        onClick={() => router.back()}
      >
        <IconArrowLeft />
      </Button>
      <MainNavBar companyuser={companyuser} />
      <div className="relative">
        <Image
          src="/banner.svg"
          alt="Logo"
          width={1920}
          height={1080}
          className="w-full h-40 sm:h-60 md:h-80 object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full h-30 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
      </div>
      <h1 className="text-5 xl font-bold mb-6 w-full flex justify-center">
        Search Results
      </h1>

      <div className="flex items-center space-x-4 mb-6 justify-center">
        <div className="grid gap-2 dark:bg-gray-950 dark:shadow-gray-600">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sortBy" className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-950 ">
              <SelectItem value="departure_time">Departure Time</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1 dark:bg-gray-950 dark:shadow-gray-700">
          <Label htmlFor="sortOrder">Order</Label>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger id="sortOrder" className="w-[180px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-950 ">
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && outboundFlights.length === 0 && !error && (
        <p className="text-center text-muted-foreground">
          No outbound flights found matching your criteria.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {outboundFlights.map((flight) => (
          <FlightCard key={flight.id_flight} flight={flight} onSelect={handleSelectOutboundFlight} isReturnFlight={false} />
        ))}
      </div>

      {selectedOutboundFlight && returnFlights.length > 0 && (
        <>
          <h2 className="text-3xl font-bold mb-6 w-full flex justify-center mt-8">
            Select Return Flight
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {returnFlights.map((flight) => (
              <FlightCard key={flight.id_flight} flight={flight} onSelect={handleBookReturnFlight} isReturnFlight={true} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
