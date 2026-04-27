"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/libs/config";

type CustomEmoji = {
    _id: string;
    name: string;
    imageUrl: string;
    user: { _id: string; name: string; email: string } | string;
    status: string;
    createdAt: string;
};

export default function AdminEmojisPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [emojis, setEmojis] = useState<CustomEmoji[]>([]);
    const [filtered, setFiltered] = useState<CustomEmoji[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status]);

    useEffect(() => {
        if (status !== "authenticated") return;
        const token = (session?.user as any)?.token;
        if (!token) return;

        async function fetchAllEmojis() {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/custom-emojis`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                setEmojis(data.data || []);
                setFiltered(data.data || []);
            } catch {
                alert("Failed to load emojis");
            } finally {
                setLoading(false);
            }
        }

        fetchAllEmojis();
    }, [status]);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        setFiltered(
            emojis.filter((e) => {
                const nameMatch = e.name.toLowerCase().includes(term);
                const owner = typeof e.user === "string" ? e.user : e.user?.name || e.user?.email || "";
                const ownerMatch = owner.toLowerCase().includes(term);
                return nameMatch || ownerMatch;
            })
        );
    }, [searchTerm, emojis]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this emoji?")) return;
        const token = (session?.user as any)?.token;
        if (!token) return;

        try {
            setDeletingId(id);
            const res = await fetch(`${API_BASE}/custom-emojis/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error();
            setEmojis((prev) => prev.filter((e) => e._id !== id));
        } catch {
            alert("Failed to delete emoji");
        } finally {
            setDeletingId(null);
        }
    };

    // if (status === "loading" || loading) {
    //     return (
    //         <main className="min-h-screen bg-[#f5f7fb] flex items-center justify-center">
    //             <p className="text-sm text-gray-500">Loading...</p>
    //         </main>
    //     );
    // }

    return (
        <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manage Custom Emojis</h1>
                        <p className="mt-2 text-sm text-gray-500">
                            View and remove custom emojis uploaded by users
                        </p>
                    </div>
                    <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-3 text-sm font-medium text-blue-700">
                        {emojis.length} emoji{emojis.length !== 1 ? "s" : ""} total
                    </div>
                </div>

                {/* Search */}
                <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <input
                            type="text"
                            placeholder="Search by emoji name or owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={() => setSearchTerm("")}
                            className="rounded-md bg-gray-100 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-200"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Emoji List */}
                <div className="mt-6 space-y-3">
                    {filtered.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                            No custom emojis found.
                        </div>
                    ) : (
                        filtered.map((emoji) => {
                            const ownerName =
                                typeof emoji.user === "string"
                                    ? emoji.user
                                    : emoji.user?.name || emoji.user?.email || "Unknown";

                            return (
                                <div
                                    key={emoji._id}
                                    className="flex items-center gap-5 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm hover:shadow-md transition"
                                >
                                    {/* Emoji Image */}
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                                        <img
                                            src={emoji.imageUrl}
                                            alt={emoji.name}
                                            className="h-12 w-12 object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {emoji.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400 truncate">
                                            by {ownerName}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400">
                                            {new Date(emoji.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    {/* <span
                                        className={`hidden md:inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                            emoji.status === "active"
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}
                                    >
                                        {emoji.status}
                                    </span> */}

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(emoji._id)}
                                        disabled={deletingId === emoji._id}
                                        className="ml-auto flex-shrink-0 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                                    >
                                        {deletingId === emoji._id ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </main>
    );
}
