import { API_BASE } from "./config";
export default async function deleteComment(
    id: string,
    token: string
) {
    const response = await fetch(
        `${API_BASE}/comments/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete comment");
    }

    return await response.json();
}