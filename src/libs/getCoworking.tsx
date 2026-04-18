export default async function getCoworking() {

    const response = await fetch("https://swdevprac-project-backend.vercel.app/api/v1/coworkingspaces", {next: {tags: ['coworking']}});
    if(!response.ok) {
        throw new Error("Failed to fetch Coworking");
    }

    return await response.json();
}