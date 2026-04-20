import { API_BASE } from "./config";
export default async function deleteReservation(id: string, token: string) {
  const res = await fetch(
    `${API_BASE}/reservations/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete");
  }

  return await res.json();
}