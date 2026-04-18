"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import updateCoworking from "@/libs/updateCoworking";

type CoworkingSpace = {
    _id: string;
    name: string;
    address: string;
    tel: string;
    openCloseTime: string;
    description: string;
    imageUrl: string;
    price: string;
};

export default function EditCoworkingForm({
    coworking,
    token,
}: {
    coworking: CoworkingSpace;
    token: string;
}) {
    const router = useRouter();

    const [name, setName] = useState(coworking.name);
    const [address, setAddress] = useState(coworking.address);
    const [tel, setTel] = useState(coworking.tel);
    const [openCloseTime, setOpenCloseTime] = useState(coworking.openCloseTime);
    const [description, setDescription] = useState(coworking.description);
    const [imageUrl, setImageUrl] = useState(coworking.imageUrl);
    const [price, setPrice] = useState(coworking.price);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setLoading(true);

            await updateCoworking(
                coworking._id,
                {
                    name,
                    address,
                    tel,
                    openCloseTime,
                    description,
                    imageUrl,
                    price,
                },
                token
            );

            alert("Updated successfully");
            router.push("/admin/spaces");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Edit Coworking Space</h1>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-md border px-4 py-3" />
                    <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="w-full rounded-md border px-4 py-3" />
                    <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Phone" className="w-full rounded-md border px-4 py-3" />
                    <input value={openCloseTime} onChange={(e) => setOpenCloseTime(e.target.value)} placeholder="Open-Close Time" className="w-full rounded-md border px-4 py-3" />
                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" className="w-full rounded-md border px-4 py-3" />
                    <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" className="w-full rounded-md border px-4 py-3" />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full rounded-md border px-4 py-3 min-h-32" />

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-blue-500 px-5 py-3 text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </div>
        </main>
    );
}