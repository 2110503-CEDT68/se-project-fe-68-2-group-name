import { API_BASE } from "./config";

export async function blockUser(userId: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE}/comments/block/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to block user");
    }
}

export async function unblockUser(userId: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE}/comments/unblock/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to unblock user");
    }
}
