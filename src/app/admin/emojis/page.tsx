"use client";

import { useEffect, useMemo, useState } from "react";
import { getSession, useSession } from "next-auth/react";
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

    const token = (session?.user as any)?.token;

    const [emojis, setEmojis] = useState<CustomEmoji[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        let cancelled = false;

        async function fetchAllEmojis() {
            try {
                setLoading(true);

                const res = await fetch(`${API_BASE}/custom-emojis`, {
                    method: "GET",
                    cache: "no-store",
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch custom emojis");
                }

                const data = await res.json();

                if (!cancelled) {
                    setEmojis(data.data || []);
                }
            } catch (error) {
                console.error("Fetch Emojis Error:", error);

                if (!cancelled) {
                    alert("Failed to load emojis");
                    setEmojis([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchAllEmojis();

        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        if (!term) return emojis;

        return emojis.filter((emoji) => {
            const nameMatch = emoji.name.toLowerCase().includes(term);

            const owner =
                typeof emoji.user === "string"
                    ? emoji.user
                    : emoji.user?.name || emoji.user?.email || "";

            const ownerMatch = owner.toLowerCase().includes(term);

            return nameMatch || ownerMatch;
        });
    }, [searchTerm, emojis]);

    const getAuthToken = async () => {
        // First try token from useSession
        if (token) return token;

        // If token is not ready in current render, refetch latest session
        const latestSession = await getSession();
        const latestToken = (latestSession?.user as any)?.token;

        return latestToken;
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this emoji?")) {
            return;
        }

        try {
            setDeletingId(id);

            const authToken = await getAuthToken();

            if (!authToken) {
                alert("Authentication token is still missing. Please logout and login again.");
                return;
            }

            const res = await fetch(`${API_BASE}/custom-emojis/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                cache: "no-store",
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Backend Error Response:", errorText);
                throw new Error("Failed to delete emoji");
            }

            setEmojis((prev) => prev.filter((emoji) => emoji._id !== id));
        } catch (error) {
            console.error("Delete Error:", error);
            alert("Failed to delete emoji. Please check the console for more details.");
        } finally {
            setDeletingId(null);
        }
    };

    if (status === "loading" || loading) {
        return (
            <main className="min-h-screen bg-[#f5f7fb] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                    <p className="text-sm font-medium text-gray-500">
                        Loading emojis...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Manage Custom Emojis
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            View and remove custom emojis uploaded by users
                        </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-3 text-sm font-medium text-blue-700">
                        {emojis.length} emoji{emojis.length !== 1 ? "s" : ""} total
                    </div>
                </div>

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

                            const isDeleting = deletingId === emoji._id;

                            return (
                                <div
                                    key={emoji._id}
                                    className="flex items-center gap-5 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm hover:shadow-md transition"
                                >
                                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                                        <img
                                            src={emoji.imageUrl}
                                            alt={emoji.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-12 w-12 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {emoji.name}
                                        </p>

                                        <p className="mt-0.5 text-xs text-gray-400 truncate">
                                            by {ownerName}
                                        </p>

                                        <p className="mt-0.5 text-xs text-gray-400">
                                            {emoji.createdAt
                                                ? new Date(emoji.createdAt).toLocaleDateString()
                                                : "No date"}
                                        </p>
                                    </div>

                                    <span
                                        className={`hidden md:inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                            emoji.status === "active"
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-gray-100 text-gray-500 border border-gray-200"
                                        }`}
                                    >
                                        {emoji.status}
                                    </span>

                                    <button
                                        onClick={() => handleDelete(emoji._id)}
                                        disabled={isDeleting}
                                        className="ml-auto flex-shrink-0 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                                    >
                                        {isDeleting ? "Deleting..." : "Delete"}
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