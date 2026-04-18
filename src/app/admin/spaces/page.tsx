import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getCoworking from "@/libs/getCoworking";
import AdminSpacesClient from "@/components/AdminSpacesClient";
import getUserProfile from "@/libs/getUserProfile";

export default async function AdminSpacesPage() {
    const session = await getServerSession(authOptions);

    if ((!session || !session.user?.token)) {
        redirect("/login");
    }

    const profile = await getUserProfile(session.user.token);

    if (profile.data.role !== "admin") {
        redirect("/");
    }

    const coworkings = await getCoworking();

    return (
        <AdminSpacesClient
            coworkings={coworkings.data}
            token={session.user.token}
        />
    );
}