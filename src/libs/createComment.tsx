export default async function createComment(
    spaceId: string,
    message: string,
    rating: number | null,
    token: string
) {
    const response = await fetch(
        `https://swdevprac-project-backend.vercel.app/api/v1/coworkingspaces/${spaceId}/comments`,
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
        throw new Error("Failed to create comment");
    }

    return await response.json();
}