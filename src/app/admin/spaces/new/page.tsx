"use client";

import { useState } from "react";
import { getSession } from "next-auth/react";
import createCoworkingSpace from "@/libs/createSpace";
import Link from "next/link";

export default function NewCoworkingSpacePage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    tel: "",
    openTime: "",
    closeTime: "",
    description: "",
    price: "",
    image: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const session = await getSession();

      if (!session?.user?.token) {
        alert("❌ Please login first");
        return;
      }

      await createCoworkingSpace(
        form.name,
        form.address,
        form.tel,
        form.description,
        form.image,
        `${form.openTime} - ${form.closeTime}`,
        form.price,
        session.user.token
      );

      alert("✅ Created successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Coworking Space
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Create a new coworking space listing for your platform
          </p>
        </div>

        {/* FORM CARD */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

          {/* NAME */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Coworking Space Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Enter space name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* ADDRESS */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Location / Address <span className="text-red-500">*</span>
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              type="text"
              placeholder="123 Main Street, City, Country"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* TEL */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              name="tel"
              value={form.tel}
              onChange={handleChange}
              type="text"
              placeholder="0812345678"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* TIME */}
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Opening Time <span className="text-red-500">*</span>
              </label>
              <input
                name="openTime"
                value={form.openTime}
                onChange={handleChange}
                type="time"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Closing Time <span className="text-red-500">*</span>
              </label>
              <input
                name="closeTime"
                value={form.closeTime}
                onChange={handleChange}
                type="time"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Provide a brief description..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* PRICE */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Price per Hour <span className="text-red-500">*</span>
            </label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              placeholder="15.00"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* IMAGE */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              type="text"
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              onClick={() => window.history.back()}
              className="rounded-md border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <Link href="/admin/spaces">
            <button
              onClick={handleSubmit}
              className="rounded-md bg-blue-500 px-6 py-3 text-sm font-medium text-white shadow hover:bg-blue-600"
            >
              + Create Coworking Space
            </button>
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}