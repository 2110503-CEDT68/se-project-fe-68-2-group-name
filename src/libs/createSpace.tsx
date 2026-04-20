import { API_BASE } from "./config";
export default async function createCoworkingSpace(
  name: string,
  address: string,
  tel: string,
  description: string,
  imageUrl: string,
  openCloseTime: string,
  price: string,
  token: string
) {
  const response = await fetch(
    `${API_BASE}/coworkingspaces`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        address,
        tel,
        description,
        imageUrl,
        openCloseTime,
        price,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create coworking space");
  }

  return await response.json();
}