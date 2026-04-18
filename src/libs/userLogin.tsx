export default async function userLogin(userEmail: string, usePassword: string) {
    const response = await fetch("https://swdevprac-project-backend.vercel.app/api/v1/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: userEmail,
            password: usePassword,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to log-in");
    }

    const json = await response.json();

    // Extract _id from JWT payload
    const payload = JSON.parse(atob(json.token.split(".")[1]));

    return {
        ...json,
        id: payload.id,    // NextAuth requires "id" field on User type
        _id: payload.id,   // keep _id for your session usage
    };
}