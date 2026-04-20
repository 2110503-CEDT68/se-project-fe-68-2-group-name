import { API_BASE } from "./config";
export default async function getAllReservations(token: string) {
  const res = await fetch(
    `${API_BASE}/reservations`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch reservations");
  }

  return await res.json();
}