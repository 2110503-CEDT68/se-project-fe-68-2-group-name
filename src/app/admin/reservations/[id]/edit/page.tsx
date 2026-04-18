import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getSingleReservation from "@/libs/getSingleReservation";
import getCoworkingById from "@/libs/getCoworkingById";
import SelectedCoWorking from "@/components/SelectedCoWorking";
import AdminEditReservationForm from "@/components/AdminEditReservationForm";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function AdminEditReservationPage({ params }: PageProps) {
    const { id } = await params;

    // 1. ตรวจสอบ Session และ Token
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).token) {
        redirect("/api/auth/signin");
    }

    // 2. ตรวจสอบสิทธิ์ Admin (ถ้ามีระบบ Role ให้เปิดคอมเมนต์ส่วนนี้)
    // const userRole = (session.user as any).role;
    // if (userRole !== "admin") redirect("/");

    const token = (session.user as any).token;
    let reservation = null;

    // 3. ดึงข้อมูลการจองด้วย id
    try {
        const resData = await getSingleReservation(id, token);
        if (resData && resData.data) {
            reservation = resData.data;
        }
    } catch (error) {
        console.error("Error fetching reservation:", error);
    }

    // ถ้าไม่พบข้อมูลให้แสดงหน้า Error
    if (!reservation) {
        return (
            <main className="min-h-screen bg-[#f8fafc] px-6 py-10 flex items-center justify-center font-sans">
                <div className="text-center rounded-2xl bg-white p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-800">Reservation Not Found</h1>
                    <p className="mt-2 text-gray-600">
                        The reservation you are trying to edit does not exist.
                    </p>
                </div>
            </main>
        );
    }

    // 4. ดึงข้อมูลสถานที่และราคา
    const spaceId = reservation.coworkingSpace?._id || reservation.coworkingSpace;
    let pricePerHour = 50;

    try {
        const spaceData = await getCoworkingById(spaceId);
        if (spaceData && spaceData.data && spaceData.data.price) {
            pricePerHour = spaceData.data.price;
        }
    } catch (error) {
        console.error("Error fetching space price:", error);
    }

    return (
        <main className="min-h-screen bg-[#f8fafc] px-6 py-10 font-sans">
            <div className="mx-auto max-w-4xl">
                <div>
                    <h1 className="text-3xl font-bold text-[#0f172a]">
                        Admin: Edit Reservation
                    </h1>
                    <p className="mt-2 text-sm text-[#64748b]">
                        Modify the booking details for User ID:{" "}
                        {reservation.user?._id || reservation.user || "Unknown"}
                    </p>
                </div>

                <div className="mt-8 rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgb(0,0,0,0.04)]">
                    <h2 className="mb-5 text-[15px] font-semibold text-[#0f172a]">
                        Workspace Details
                    </h2>
                    <SelectedCoWorking id={spaceId} />
                </div>

                <div className="mt-6 rounded-[20px] border border-gray-100 bg-white p-6 shadow-[0_2px_10px_rgb(0,0,0,0.04)]">
                    <AdminEditReservationForm
                        reservation={reservation}
                        pricePerHour={pricePerHour}
                        token={token}
                    />
                </div>
            </div>
        </main>
    );
}