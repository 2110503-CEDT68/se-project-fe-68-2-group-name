import { API_BASE } from "./config";
export default async function deleteCoworking(id: string, token: string) {
    const response = await fetch(
        `${API_BASE}/coworkingspaces/${id}`,
        {
            method: "DELETE",
            headers: {
                authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete coworking space");
    }

    return await response.json();
}