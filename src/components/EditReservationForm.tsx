"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import updateReservation from "@/libs/updateReservation";

// 🌟 เพิ่ม token เข้ามาใน Props
interface EditReservationFormProps {
  reservation: any;
  pricePerHour: number;
  token: string; 
}

export default function EditReservationForm({ reservation, pricePerHour, token }: EditReservationFormProps) {
  const router = useRouter();
  
  // 🌟 ลบ useSession ออกได้เลย เพราะเรารับ token มาจาก Server แล้ว ทำให้เบาขึ้นเยอะ!

  const initialDateObj = new Date(reservation.resvDate);
  const initialDateStr = initialDateObj.toISOString().split('T')[0]; 
  const initialTimeStr = initialDateObj.toTimeString().substring(0, 5); 

  const initialDuration = reservation.totalCost ? (reservation.totalCost / pricePerHour) : 0;

  const [date, setDate] = useState(initialDateStr);
  const [time, setTime] = useState(initialTimeStr);
  const [duration, setDuration] = useState<number>(initialDuration); 
  const [capacity, setCapacity] = useState<number>(reservation.capacity || 0);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalCost = duration * pricePerHour;
  const isCapacityError = capacity > 8;

  const handleUpdateReservation = async () => {
    // ใช้ token จาก Props ได้เลย
    if (!token) {
      alert("Please sign in to update your reservation.");
      return;
    }

    if (!date || !time || duration <= 0 || capacity <= 0) {
        alert("Please fill in all required fields correctly (Duration and People must be greater than 0).");
        return;
    }

    if (isCapacityError) {
        alert("Maximum capacity is 8 people.");
        return;
    }

    const confirmUpdate = window.confirm("Are you sure you want to save these changes?");
    if (!confirmUpdate) return;

    setIsProcessing(true); 

    const newResvDate = new Date(`${date}T${time}:00`).toISOString();

    try {
      // 🌟 ส่ง token เข้าไปในฟังก์ชัน update ได้ทันที
      await updateReservation(reservation._id, newResvDate, capacity, totalCost, token);
      
      router.refresh(); 
      router.push("/reservations");
      
    } catch (error) {
      console.error(error);
      alert("Failed to update reservation. Please try again.");
      setIsProcessing(false); 
    }
  };

  const inputClassName = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-500 transition-colors";
  const errorInputClassName = "w-full rounded-xl border border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700 placeholder:text-red-300 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors";

  return (
    <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700">Booking Details</h2>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Reservation Date</label>
          <input
            type="date"
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Duration (Hours)</label>
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
          <label className="mb-2 block text-sm font-medium text-gray-700">Start Time</label>
          <input
            type="time"
            value={time} 
            onChange={(e) => setTime(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Number of People</label>
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
        <label className="mb-2 block text-sm font-medium text-gray-700">Special Requests (Optional)</label>
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
        onClick={handleUpdateReservation}
        disabled={isProcessing}
        className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-medium text-white shadow transition-colors ${
            isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
      >
        {isProcessing ? "Saving Changes..." : "Save Changes"}
      </button>
    </div>
  );
}