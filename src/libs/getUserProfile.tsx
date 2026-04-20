import { API_BASE } from "./config";
export default async function getUserProfile(token : string) {
    const response = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: {
            authorization: `Bearer ${token}`,
        }
    })

    if(!response.ok){
        throw new Error("Cannot get user profile")
    }

    return await response.json();
}