import { API_BASE } from "./config";
export default async function createReservation(
    spaceId: string, 
    resvDate: string, 
    capacity: number,     // เพิ่มรับค่า capacity
    totalCost: number,    // เพิ่มรับค่า totalCost
    token: string
) {
    const response = await fetch(`${API_BASE}/coworkingspaces/${spaceId}/reservations/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // ส่ง Token ไปให้ Backend รู้ว่าใครจอง
        },
        body: JSON.stringify({
            resvDate: resvDate,
            capacity: capacity,       // ส่ง capacity ให้ Backend
            totalCost: totalCost      // ส่ง totalCost ให้ Backend
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to create reservation");
    }

    return await response.json();
}