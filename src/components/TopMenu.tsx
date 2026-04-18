import Link from "next/link";
import Image from "next/image";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

export default async function TopMenu() {

    const session = await getServerSession(authOptions);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image src="/img/logo.png" alt="logo" width={30} height={30} priority className="object-contain" />
                    <span className="text-lg font-semibold text-gray-900">CoSpace</span>
                </div>

                <div className="flex items-center gap-8 text-sm text-gray-600">
                    <Link href="/" className="hover:text-blue-500 font-medium">
                        Home
                    </Link>
                    <Link href="/spaces" className="hover:text-blue-500">
                        Browse Spaces
                    </Link>
                    <Link href="/reservations" className="hover:text-blue-500">
                        My Reservations
                    </Link>
                </div>

                {
                    session ?
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="text-sm text-gray-600 hover:text-blue-500">
                                Profile
                            </Link>
                            <Link
                                href="/api/auth/signout"
                                className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                Sign Out
                            </Link>
                        </div>
                        :
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm text-gray-600 hover:text-blue-500">
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                Get Started
                            </Link>
                        </div>
                }

            </div>
        </header>
    );
}