"use client";

import { useState } from "react";
import Link from "next/link";
import ManageSpaceCard from "@/components/ManageSpaceCard";
import { CoworkingSpace } from "../../interfaces";
import deleteCoworking from "@/libs/deleteCoworking";

type AdminSpacesClientProps = {
    coworkings: CoworkingSpace[];
    token: string;
};

export default function AdminSpacesClient({
    coworkings,
    token,
}: AdminSpacesClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [spaces, setSpaces] = useState(coworkings);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this coworking space?"
        );
        if (!confirmed) return;

        try {
            setDeletingId(id);
            await deleteCoworking(id, token);
            setSpaces((prev) => prev.filter((space) => space._id !== id));
        } catch (error) {
            console.error(error);
            alert("Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredSpaces = spaces.filter((space) =>
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Manage Coworking Spaces
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Add, edit, or remove coworking spaces from your platform
                        </p>
                    </div>

                    <Link
                        href="/admin/spaces/new"
                        className="rounded-md bg-blue-500 px-5 py-3 text-sm font-medium text-white hover:bg-blue-600"
                    >
                        + Add Coworking Space
                    </Link>
                </div>

                <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row">
                        <input
                            type="text"
                            placeholder="Search by location or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />

                        <button className="rounded-md bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-600">
                            Search
                        </button>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {filteredSpaces.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                            No coworking spaces found.
                        </div>
                    ) : (
                        filteredSpaces.map((space) => (
                            <ManageSpaceCard
                                key={space._id}
                                title={space.name}
                                location={space.address}
                                description={space.description}
                                price={space.price}
                                imageUrl={space.imageUrl}
                                onDelete={() => handleDelete(space._id)}
                                editHref={`/admin/spaces/${space._id}/edit`}
                            />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}