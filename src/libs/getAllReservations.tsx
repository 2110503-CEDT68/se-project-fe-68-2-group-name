export default async function getAllReservations(token: string) {
  const res = await fetch(
    "https://swdevprac-project-backend.vercel.app/api/v1/reservations",
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