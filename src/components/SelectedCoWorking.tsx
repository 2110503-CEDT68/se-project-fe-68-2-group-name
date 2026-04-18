import Image from "next/image";
import getCoworkingById from "@/libs/getCoworkingById";

export default async function SelectedCoWorking({ id }: { id: string }) {
  
  const coWorkingData = await getCoworkingById(id);
  const space = coWorkingData.data;

  if (!space) {
    return <div className="text-red-500">Workspace not found.</div>;
  }

  return (
    <div className="mt-4 flex flex-col gap-6 md:flex-row">
      <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-xl md:h-auto md:w-[280px]">
        <img
          src={space.imageUrl}
          alt={space.name}
          className="h-full w-full bg-gray-100 object-cover"
        />
      </div>

      <div className="flex flex-col justify-center">
        <h3 className="text-xl font-bold text-gray-900">
          {space.name}
        </h3>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {space.address}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          {space.description}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-3 text-sm text-gray-600">
          
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {space.openCloseTime}
          </div>

          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            1-8 people
          </div>

          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
            High-speed WiFi
          </div>
          
        </div>

        <hr className="my-5 border-gray-100" />

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-blue-600">${space.price || 45}</span>
          <span className="text-sm font-medium text-gray-500">/hour</span>
        </div>
      </div>
    </div>
  );
}