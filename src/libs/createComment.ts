import { API_BASE } from "./config";
export default async function createComment(
    spaceId: string,
    message: string,
    rating: number | null,
    token: string
) {
    const response = await fetch(
        `${API_BASE}/coworkingspaces/${spaceId}/comments`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message, rating }),
        }
    );

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create comment");
    }

    return await response.json();
}
