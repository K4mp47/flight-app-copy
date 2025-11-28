"use client";

import { useEffect, useState } from "react";
import { MainNavBar } from "@/components/MainNavBar";
import { reservationService } from "@/services/reservation";
import { toast } from "sonner";
import { PassengerTicket } from "@/types/passenger-ticket";

export default function PurchaseHistoryPage() {
  const [purchases, setPurchases] = useState<PassengerTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        const data = await reservationService.getPurchaseHistory();
        setPurchases(data || []);
      } catch (error) {
        toast.error("Failed to fetch purchase history.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, []);

  return (
    <div className="min-h-screen">
      <MainNavBar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Purchase History</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {purchases.length === 0 ? (
              <p>No purchases found.</p>
            ) : (
              <ul>
                {purchases.map((purchase) => (
                  <li key={purchase.ticket.id_ticket} className="mb-4 border p-4 rounded-lg">
                    <p><strong>Flight:</strong> {purchase.ticket.flight?.sections?.[0]?.section?.code_departure_airport} to {purchase.ticket.flight?.sections?.[0]?.section?.code_arrival_airport}</p>
                    <p><strong>Price:</strong> ${purchase.ticket.price}</p>
                    <p><strong>Date:</strong> {new Date(purchase.ticket.flight.scheduled_departure_day).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
