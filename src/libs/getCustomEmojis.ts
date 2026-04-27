import { API_BASE } from "./config";

export default async function getCustomEmojis(token: string) {
    const response = await fetch(`${API_BASE}/custom-emojis/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch custom emojis");
    }

    return await response.json();
}
