import { API_BASE } from "./config";
// libs/reportComment.ts
export default async function reportComment(commentId: string, token: string) {
    const response = await fetch(`${API_BASE}/comments/${commentId}/report`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to report comment");
    }

    return await response.json();
}