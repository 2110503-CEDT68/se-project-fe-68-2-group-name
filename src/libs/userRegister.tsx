import { API_BASE } from "./config";
export default async function userRegister(fullName:string, email:string, telephone:string, usePassword:string) {
    
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: fullName,
            email: email,
            tel: telephone,
            password: usePassword
        }),
    })

    if(!response.ok){
        throw new Error("Failed to log-in")
    }

    return await response.json();
}