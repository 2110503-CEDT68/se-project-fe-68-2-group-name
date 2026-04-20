import { API_BASE } from "./config";
export default async function updateReservation(
    resId: string, 
    resvDate: string, 
    capacity: number, 
    totalCost: number, 
    token: string
) {
    const response = await fetch(`${API_BASE}/reservations/${resId}`, {
        method: "PUT", 
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            resvDate: resvDate,
            capacity: capacity,
            totalCost: totalCost
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update reservation");
    }

    return await response.json();
}