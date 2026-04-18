export default async function getCoworkingById(id: string) {
    const response = await fetch(
        `https://swdevprac-project-backend.vercel.app/api/v1/coworkingspaces/${id}`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch coworking space");
    }

    return await response.json();
}