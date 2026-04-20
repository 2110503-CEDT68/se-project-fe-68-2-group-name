import { API_BASE } from "./config";

export default async function userLogin(userEmail: string, userPassword: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: userEmail,
            password: userPassword,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to log-in");
    }

    const json = await response.json();

    const payload = JSON.parse(atob(json.token.split(".")[1]));

    return {
        ...json,
        id: payload.id,
        _id: payload.id,
    };
}