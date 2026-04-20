import { API_BASE } from "./config";
export default async function getCoworkingById(id: string) {
    const response = await fetch(
        `${API_BASE}/coworkingspaces/${id}`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch coworking space");
    }

    return await response.json();
}