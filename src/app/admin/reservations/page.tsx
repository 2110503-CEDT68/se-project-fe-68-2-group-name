import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getUserProfile from "@/libs/getUserProfile";
import AdminReservationsClient from "@/components/AdminReservationsClient";

export default async function AdminReservationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.token) {
    redirect("/login");
  }

  const profile = await getUserProfile(session.user.token);

  if (profile.data.role !== "admin") {
    redirect("/");
  }

  return <AdminReservationsClient token={session.user.token} />;
}