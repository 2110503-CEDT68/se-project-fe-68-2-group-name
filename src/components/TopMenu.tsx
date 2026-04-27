// src/components/TopMenu.tsx
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import getUserProfile from "@/libs/getUserProfile";

export default async function TopMenu() {
    const session = await getServerSession(authOptions);

    let isAdmin = false;
    if (session?.user?.token) {
        try {
            const profile = await getUserProfile(session.user.token);
            isAdmin = profile.data.role === "admin";
        } catch {
            isAdmin = false;
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Image
                        src="/img/logo.png"
                        alt="logo"
                        width={30}
                        height={30}
                        priority
                        className="object-contain"
                    />
                    <span className="text-lg font-semibold text-gray-900">
                        CoSpace
                    </span>
                </div>

                {/* Nav links */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                    <Link href="/" className="hover:text-blue-500 font-medium">
                        Home
                    </Link>
                    <Link href="/spaces" className="hover:text-blue-500">
                        Browse Spaces
                    </Link>
                    <Link href="/reservations" className="hover:text-blue-500">
                        My Reservations
                    </Link>

                    {/* Admin dropdown */}
                    {isAdmin && (
                        <div className="relative group">
                            <button className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                                Admin
                                <svg
                                    className="h-3.5 w-3.5 text-gray-500 group-hover:rotate-180 transition-transform duration-200"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {/* Dropdown */}
                            <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg">
                                <Link
                                    href="/admin/spaces"
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <span className="text-base">🏢</span>
                                    Manage Spaces
                                </Link>
                                <Link
                                    href="/admin/reservations"
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <span className="text-base">📅</span>
                                    Manage Reservations
                                </Link>
                                <div className="my-1 mx-3 h-px bg-gray-100" />
                                <Link
                                    href="/admin/comments"
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <span className="text-base">💬</span>
                                    Reported Comments
                                </Link>
                                <Link
                                    href="/admin/emojis"
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <span className="text-base">😒</span>
                                    Custom Emojis
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Auth buttons */}
                {session ? (
                    <div className="flex items-center gap-4">
                        <Link
                            href="/profile"
                            className="text-sm text-gray-600 hover:text-blue-500"
                        >
                            Profile
                        </Link>
                        <Link
                            href="/api/auth/signout"
                            className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Sign Out
                        </Link>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-sm text-gray-600 hover:text-blue-500"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/register"
                            className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}