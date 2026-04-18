import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import getUserProfile from "@/libs/getUserProfile";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.token) {
    redirect("/login");
  }

  const profile = await getUserProfile(session.user.token);
  const createdAt = new Date(profile.data.createdAt);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your account information
          </p>
        </div>

        <div className="mt-8 max-w-2xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl text-blue-500">
              👤
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {profile.data.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{profile.data.email}</p>
              <p className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                Member
              </p>
            </div>
          </div>

          <div className="my-8 h-px w-full bg-gray-200"></div>

          <div className="space-y-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
              <span className="w-24 text-sm text-gray-400">Email</span>
              <span className="text-sm font-medium text-gray-800">
                {profile.data.email}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
              <span className="w-24 text-sm text-gray-400">Phone</span>
              <span className="text-sm font-medium text-gray-800">
                {profile.data.tel || "-"}
              </span>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
              <span className="w-24 text-sm text-gray-400">Role</span>
              <span className="text-sm font-medium text-gray-800">{profile.data.role}</span>
            </div>

            <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
              <span className="w-24 text-sm text-gray-400">Joined</span>
              <span className="text-sm font-medium text-gray-800">
                {createdAt.toDateString()}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/api/auth/signout">
              <button className="rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Logout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}