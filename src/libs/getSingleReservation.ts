import { API_BASE } from "./config";
export default async function getSingleReservation(resId: string, token: string) {
    const response = await fetch(`${API_BASE}/reservations/${resId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
        cache: "no-store" 
    });

    if (!response.ok) {
        throw new Error("Failed to fetch reservation");
    }

    return await response.json();
}