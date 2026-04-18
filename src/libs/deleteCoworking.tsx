export default async function deleteCoworking(id: string, token: string) {
    const response = await fetch(
        `https://swdevprac-project-backend.vercel.app/api/v1/coworkingspaces/${id}`,
        {
            method: "DELETE",
            headers: {
                authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete coworking space");
    }

    return await response.json();
}