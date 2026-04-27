import { API_BASE } from "./config";

export default async function deleteCustomEmoji(emojiId: string, token: string) {
    const response = await fetch(`${API_BASE}/custom-emojis/${emojiId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to delete custom emoji");
    }

    return await response.json();
}
