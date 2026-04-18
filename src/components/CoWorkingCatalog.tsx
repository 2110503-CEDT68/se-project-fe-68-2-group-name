"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CoWorkingSpaceCard from "./CoWorkingSpaceCard";

export default function CoWorkingCatalog({ CoJson }: { CoJson: any }) {
  const [inputValue, setInputValue] = useState("");
  const [searchText, setSearchText] = useState("");

  const filteredData = useMemo(() => {
    return CoJson.data.filter((CoItem: any) => {
      const keyword = searchText.toLowerCase().trim();

      if (!keyword) return true;

      return (
        CoItem.name.toLowerCase().includes(keyword) ||
        CoItem.address.toLowerCase().includes(keyword)
      );
    });
  }, [CoJson.data, searchText]);

  const handleSearch = () => {
    setSearchText(inputValue);
  };

  return (
    <div className="w-full">
      <section className="pb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Find Your Perfect Workspace
          </h1>
          <p className="mt-3 text-gray-500">
            Discover amazing coworking spaces in your area
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row">
          <input
            type="text"
            placeholder="Search by location or name..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 rounded-md border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />

          <button
            onClick={handleSearch}
            className="rounded-md bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </section>

      <h2 className="mb-6 text-center text-xl font-bold text-gray-600">
        We have {filteredData.length} Co-Working Spaces for You
      </h2>

      <div className="grid grid-cols-1 gap-6 p-4 mx-auto max-w-7xl sm:grid-cols-2 md:grid-cols-3">
        {filteredData.map((CoItem: any) => (
          <Link
            href={`/spaces/${CoItem.id}`}
            key={CoItem.id}
            className="block h-full w-full transition-transform duration-300 hover:scale-[1.02]"
          >
            <CoWorkingSpaceCard
              coId={CoItem.id}
              coAddress={CoItem.address}
              coTel={CoItem.tel}
              coOpenCloseTime={CoItem.openCloseTime}
              coName={CoItem.name}
              imgSrc={CoItem.imageUrl}
              coDesc={CoItem.description}
              coPrice={CoItem.price}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}