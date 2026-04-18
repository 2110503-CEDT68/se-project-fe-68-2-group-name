import SelectedWorkSpace from "@/components/SelectedCoWorking";
import BookingForm from "@/components/BookingForm";
import getCoworkingById from "@/libs/getCoworkingById";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import CommentSection from "@/components/CommentSection";

export default async function ReservePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const token = (session?.user as any)?.token || null;

  const coWorkingData = await getCoworkingById(id);
  const space = coWorkingData.data;
  const pricePerHour = space?.price || 45;

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Reservation
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Review your selection and confirm your booking details
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Selected Workspace
          </h2>
          <SelectedWorkSpace id={id} />
        </div>

        <BookingForm
          pricePerHour={pricePerHour}
          spaceId={id}
          token={token}
        />

        <CommentSection
          spaceId={id}
          token={token}
        />
      </div>
    </main>
  );
}