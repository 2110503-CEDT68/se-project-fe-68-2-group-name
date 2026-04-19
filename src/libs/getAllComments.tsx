// src/libs/getAllComments.tsx
export default async function getAllComments() {
    // Step 1: fetch all coworking spaces
    const spacesRes = await fetch(
        "https://swdevprac-project-backend.vercel.app/api/v1/coworkingspaces",
        { cache: "no-store" }
    );

    if (!spacesRes.ok) {
        throw new Error("Failed to fetch coworking spaces");
    }

    const spacesData = await spacesRes.json();
    const spaces: { _id: string; name: string }[] = spacesData.data || [];

    // Step 2: fetch comments for each space in parallel
    const commentResults = await Promise.allSettled(
        spaces.map(async (space) => {
            const commentsRes = await fetch(
                `https://swdevprac-project-backend.vercel.app/api/v1/coworkingspaces/${space._id}/comments`,
                { cache: "no-store" }
            );

            if (!commentsRes.ok) return [];

            const commentsData = await commentsRes.json();
            // Attach spaceName to each comment for display
            return (commentsData.data || []).map((c: any) => ({
                ...c,
                spaceName: space.name,
                spaceId: space._id,
            }));
        })
    );

    // Step 3: flatten all comments
    const allComments: any[] = [];
    for (const result of commentResults) {
        if (result.status === "fulfilled") {
            allComments.push(...result.value);
        }
    }

    return allComments;
}
