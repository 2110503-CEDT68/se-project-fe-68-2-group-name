"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import getAllReservations from "@/libs/getAllReservations";
import deleteReservation from "@/libs/deleteReservations";

type Reservation = {
  _id: string;
  coworkingSpace?: {
    name: string;
    address: string;
  };
  resvDate: string;
  capacity: number;
  totalCost: number;
};

export default function AdminReservationsClient({
  token,
}: {
  token: string;
}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllReservations(token);
      setReservations(data.data);
    } catch (err) {
      console.error("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reservation?")) return;

    try {
      await deleteReservation(id, token);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    setSearchQuery(searchTerm.trim());
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (!searchQuery) return true;
    return reservation._id === searchQuery;
  });

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Reservations
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            View and manage all coworking space reservations
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              All Reservations
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by exact ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-3 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-64"
                />
              </div>

              <button
                onClick={handleSearch}
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 sm:w-auto w-full"
              >
                Search
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Reservation ID</th>
                  <th className="px-5 py-4 font-medium">Space</th>
                  <th className="px-5 py-4 font-medium">Date & Info</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredReservations.length > 0 ? (
                  filteredReservations.map((reservation) => (
                    <tr
                      key={reservation._id}
                      className="border-t border-gray-100 text-sm hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 align-top max-w-[150px]">
                        <p className="font-mono text-xs font-medium text-blue-600 break-all bg-blue-50 p-1.5 rounded border border-blue-100">
                          {reservation._id}
                        </p>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-gray-900">
                          {reservation.coworkingSpace?.name}
                        </p>
                        <p className="mt-1 text-gray-500">
                          {reservation.coworkingSpace?.address}
                        </p>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <p className="font-medium text-gray-900">
                          {new Date(reservation.resvDate).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="mt-1 text-gray-500">
                          Capacity: {reservation.capacity} | Cost: ${reservation.totalCost}
                        </p>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/reservations/${reservation._id}/edit`}
                            className="inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(reservation._id)}
                            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center text-gray-400">
                      Empty. No reservation found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}