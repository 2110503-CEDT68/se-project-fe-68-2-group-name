// libs/reportComment.ts
export default async function reportComment(commentId: string, token: string) {
    const response = await fetch(`https://swdevprac-project-backend.vercel.app/api/v1/comments/${commentId}/report`, {
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