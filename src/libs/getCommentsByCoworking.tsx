export default async function getCommentsByCoworking(id: string) {
    const response = await fetch(
        `https://swdevprac-project-backend.vercel.app/api/v1/coworkingspaces/${id}/comments`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch comments for coworking space");
    }

    return await response.json();
}