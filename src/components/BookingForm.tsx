"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import createReservation from "@/libs/createReservation";

export default function BookingForm({
  pricePerHour,
  spaceId,
  token,
}: {
  pricePerHour: number;
  spaceId: string;
  token: string | null;
}) {
  const router = useRouter();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState<number>(0);
  const [capacity, setCapacity] = useState<number>(0);

  const totalCost = duration * pricePerHour;
  const isCapacityError = capacity > 8;

  const handleConfirmReservation = async () => {
    if (!token) {
      alert("Please sign in to make a reservation.");
      router.push("/login");
      return;
    }

    if (!date || !time || duration <= 0 || capacity <= 0) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    if (isCapacityError) {
      alert("ไม่สามารถจองได้! จำนวนคนเกินกว่าที่สถานที่รองรับ (สูงสุด 8 คน)");
      return;
    }

    const resvDate = new Date(`${date}T${time}:00`).toISOString();

    try {
      await createReservation(spaceId, resvDate, capacity, totalCost, token);
      alert("Reservation Successful!");
      router.push("/reservations");
    } catch (error) {
      console.error(error);
      alert("Failed to make a reservation. Please try again orReservation failed. You have either reached the 3-booking limit or an error occurred. Please try again.");
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors";

  const errorInputClassName =
    "w-full rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 placeholder:text-red-300 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors";

  return (
    <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700">Booking Details</h2>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Reservation Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Duration (Hours)
          </label>
          <input
            type="number"
            min="1"
            placeholder="e.g., 2"
            value={duration || ""}
            onChange={(e) => setDuration(Number(e.target.value))}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Number of People
          </label>
          <input
            type="number"
            placeholder="2"
            value={capacity || ""}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className={isCapacityError ? errorInputClassName : inputClassName}
          />
          {isCapacityError && (
            <p className="mt-1 text-xs font-medium text-red-500">
              * Maximum capacity is 8 people
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Special Requests (Optional)
        </label>
        <textarea
          placeholder="Any special requirements or requests for your booking..."
          rows={4}
          className={inputClassName}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Total Cost</span>
        <span className="text-2xl font-bold text-blue-500">${totalCost}</span>
      </div>

      <button
        onClick={handleConfirmReservation}
        className="mt-6 w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-medium text-white shadow hover:bg-blue-600 transition-colors"
      >
        Confirm Reservation
      </button>
    </div>
  );
}