import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getCoworkingById from "@/libs/getCoworkingById";
import EditCoworkingForm from "@/components/EditCoworkingForm";

export default async function EditCoworkingPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.token) {
        redirect("/login");
    }

    const coworking = await getCoworkingById(id);

    return (
        <EditCoworkingForm
            token={session.user.token}
            coworking={coworking.data}
        />
    );
}