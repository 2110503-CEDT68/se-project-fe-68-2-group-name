export default async function deleteComment(
    id: string,
    token: string
) {
    const response = await fetch(
        `https://swdevprac-project-backend.vercel.app/api/v1/comments/${id}`,
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