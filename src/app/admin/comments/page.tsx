// src/app/admin/comments/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getUserProfile from "@/libs/getUserProfile";
import AdminCommentsClient from "@/components/AdminCommentsClient";

export default async function AdminCommentsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.token) {
        redirect("/login");
    }

    const profile = await getUserProfile(session.user.token);

    if (profile.data.role !== "admin") {
        redirect("/");
    }

    return <AdminCommentsClient token={session.user.token} />;
}
