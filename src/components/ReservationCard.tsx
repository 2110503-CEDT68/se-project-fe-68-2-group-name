"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import deleteReservation from "@/libs/deleteReservations";
import Link from "next/link";

interface ReservationCardProps {
    reservation: any;
    token: string;
}

export default function ReservationCard({ reservation, token }: ReservationCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!reservation) return null;

    const resvDateObj = new Date(reservation.resvDate);
    const formattedDate = resvDateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
    const formattedTime = resvDateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const isPast = resvDateObj < new Date();
    const statusText = isPast ? "Completed" : "Upcoming";
    const statusBadgeClass = isPast
        ? "bg-gray-100 text-gray-600"
        : "bg-green-100 text-green-600";

    const spaceName = reservation.coworkingSpace?.name || "Unknown Workspace";
    const spaceAddress = reservation.coworkingSpace?.address || "Address not available";

    const resId = reservation._id;

    const handleCancel = async () => {
        const confirmDelete = window.confirm(
            `Are you sure you want to cancel the reservation at ${spaceName}?`
        );
        if (!confirmDelete) return;

        if (!token) {
            alert("Please login first");
            return;
        }

        setIsDeleting(true);

        try {
            await deleteReservation(reservation._id, token);
            router.refresh();
        } catch (error) {
            console.error("Error cancelling reservation:", error);
            alert("Failed to cancel reservation. Please try again.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{spaceName}</h2>
                    <p className="mt-1 text-sm text-gray-500">{spaceAddress}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass}`}>
                    {statusText}
                </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{formattedDate}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Start Time</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">{formattedTime}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Capacity</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                        {reservation.capacity ? `${reservation.capacity} People` : "-"}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Total Cost</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                        {reservation.totalCost ? `$${reservation.totalCost}` : "-"}
                    </p>
                </div>
            </div>

            {!isPast && (
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Link href={`/reservations/${resId}/edit`}>
                        <button className="w-full rounded-md bg-blue-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600">
                            Edit Reservation
                        </button>
                    </Link>

                    <button
                        onClick={handleCancel}
                        disabled={isDeleting}
                        className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors
                        ${
                            isDeleting
                                ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                                : "border-red-300 text-red-500 hover:bg-red-50"
                        }`}
                    >
                        {isDeleting ? "Cancelling..." : "Cancel Reservation"}
                    </button>
                </div>
            )}
        </div>
    );
}