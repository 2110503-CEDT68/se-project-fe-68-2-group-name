export default async function updateComment(
    id: string,
    data: {
        message: string;
    },
    token: string
) {
    const response = await fetch(
        `https://swdevprac-project-backend.vercel.app/api/v1/comments/${id}`,
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