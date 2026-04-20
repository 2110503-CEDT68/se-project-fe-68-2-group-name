import { API_BASE } from "./config";
export default async function getCommentsByCoworking(id: string) {
    const response = await fetch(
        `${API_BASE}/coworkingspaces/${id}/comments`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch comments for coworking space");
    }

    return await response.json();
}