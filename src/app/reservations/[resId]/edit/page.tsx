import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getSingleReservation from "@/libs/getSingleReservation";
import getCoworkingById from "@/libs/getCoworkingById";
import SelectedCoWorking from "@/components/SelectedCoWorking";
import EditReservationForm from "@/components/EditReservationForm";

type PageProps = {
    params: Promise<{ resId: string }>;
};

export default async function EditReservationPage({ params }: PageProps) {
    const { resId } = await params;

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).token) {
        redirect("/login");
    }

    const token = (session.user as any).token;
    let reservation = null;

    try {
        const resData = await getSingleReservation(resId, token);
        reservation = resData.data;
    } catch (error) {
        console.error("Error fetching reservation:", error);
    }

    if (!reservation) {
        return (
            <main className="min-h-screen bg-[#f5f7fb] px-6 py-10 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Reservation Not Found</h1>
                    <p className="mt-2 text-gray-600">
                        The reservation you are trying to edit does not exist or you do not have permission.
                    </p>
                </div>
            </main>
        );
    }

    const spaceId = reservation.coworkingSpace?._id || reservation.coworkingSpace;

    let pricePerHour = 45;
    try {
        const spaceData = await getCoworkingById(spaceId);
        if (spaceData && spaceData.data && spaceData.data.price) {
            pricePerHour = spaceData.data.price;
        }
    } catch (error) {
        console.error("Error fetching space price:", error);
    }

    return (
        <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
            <div className="mx-auto max-w-4xl">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Your Reservation
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Modify your booking details below and confirm the changes.
                    </p>
                </div>

                <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-sm font-semibold text-gray-700">
                        Workspace Details
                    </h2>
                    <SelectedCoWorking id={spaceId} />
                </div>

                <EditReservationForm
                    reservation={reservation}
                    pricePerHour={pricePerHour}
                    token={token}
                />
            </div>
        </main>
    );
}