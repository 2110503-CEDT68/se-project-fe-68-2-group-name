import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import Link from "next/link";
import ReservationCard from "@/components/ReservationCard";
import getAllReservations from "@/libs/getAllReservations";

export default async function ReservationsPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.token) {
        redirect("/login");
    }

    const token = session.user.token;
    const userId = session.user._id;

    console.log("userId:", userId);
    console.log("=== FULL session.user ===", JSON.stringify(session.user, null, 2));

    let myReservations = [];

    try {
        const resData = await getAllReservations(token);
        const allReservations = resData.data || [];

        console.log("first reservation user field:", allReservations[0]?.user);
        console.log("userId from session:", userId);

        myReservations = allReservations
            .filter((res: any) => {
                const resUserId = res.user?._id ?? res.user;
                return String(resUserId) === String(userId);
            })
            .sort((a: any, b: any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

        console.log("filtered count:", myReservations.length);
    } catch (error) {
        console.error("Error fetching reservations:", error);
    }

    return (
        <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Manage and track your coworking space bookings
                        </p>
                    </div>
                    <Link href="/spaces">
                        <button className="rounded-md bg-blue-500 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600">
                            + New Reservation
                        </button>
                    </Link>
                </div>

                <div className="mt-6 space-y-4">
                    {myReservations.length === 0 ? (
                        <div className="rounded-2xl border border-gray-100 bg-white py-10 text-center text-gray-500 shadow-sm">
                            You have no reservations yet.
                        </div>
                    ) : (
                        myReservations.map((reservation: any) => (
                            <ReservationCard
                                key={reservation._id}
                                reservation={reservation}
                                token={token}
                            />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}