import { API_BASE } from "./config";
export default async function getCoworking() {

    const response = await fetch(`${API_BASE}/coworkingspaces`, {next: {tags: ['coworking']}});
    if(!response.ok) {
        throw new Error("Failed to fetch Coworking");
    }

    return await response.json();
}