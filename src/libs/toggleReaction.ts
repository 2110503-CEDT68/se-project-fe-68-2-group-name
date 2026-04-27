import { API_BASE } from "./config";

export default async function toggleReaction(commentId: string, emojiType: string, emojiValue: any, token: string) {
    const payload: any = {
        emojiType,
        emojiValue: emojiType === 'default' ? emojiValue : (typeof emojiValue === 'string' ? emojiValue : emojiValue._id),
        ...(emojiType === 'custom' && {
            customEmoji: typeof emojiValue === 'string' ? emojiValue : emojiValue._id,
        }),
    };

    const response = await fetch(`${API_BASE}/comments/${commentId}/reactions/toggle`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Failed to toggle reaction");
    }

    return await response.json();
}
