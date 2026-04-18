export default async function deleteReservation(id: string, token: string) {
  const res = await fetch(
    `https://swdevprac-project-backend.vercel.app/api/v1/reservations/${id}`,
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