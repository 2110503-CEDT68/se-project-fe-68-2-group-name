export default async function updateCoworking(
    id: string,
    data: {
        name: string;
        address: string;
        tel: string;
        openCloseTime: string;
        description: string;
        imageUrl: string;
        price: string;
    },
    token: string
) {
    const response = await fetch(
        `https://swdevprac-project-backend.vercel.app/api/v1/coworkingspaces/${id}`,
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
        throw new Error("Failed to update coworking space");
    }

    return await response.json();
}