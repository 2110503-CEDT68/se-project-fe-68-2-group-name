import { API_BASE } from "./config";

export default async function createCustomEmoji(name: string, file: File, token: string) {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", file); // ต้องตรงกับชื่อที่ multer รอรับใน upload.single('image')

    const response = await fetch(`${API_BASE}/custom-emojis`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create custom emoji");
    }

    return await response.json();
}