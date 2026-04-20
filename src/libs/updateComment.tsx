import { API_BASE } from "./config";
export default async function updateComment(
    id: string,
    data: { message: string; rating?: number | null },
    token: string
) {
    const response = await fetch(
        `${API_BASE}/comments/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update comment");
    }

    return await response.json();
}