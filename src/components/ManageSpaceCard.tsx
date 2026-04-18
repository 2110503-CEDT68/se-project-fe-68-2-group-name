import Link from "next/link";

type ManageSpaceCardProps = {
    title: string;
    location: string;
    description: string;
    price: string;
    imageUrl?: string;
    onDelete?: () => void;
    editHref?: string;
};

export default function ManageSpaceCard({
    title,
    location,
    description,
    price,
    imageUrl,
    onDelete,
    editHref
}: ManageSpaceCardProps) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="h-28 w-full overflow-hidden rounded-xl bg-gray-200 md:w-40">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={title}
                            className="h-full w-full object-cover"
                        />
                    ) : null}
                </div>

                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <p className="mt-1 text-sm text-gray-500">{location}</p>

                    <p className="mt-3 text-sm text-gray-600">{description}</p>

                    <p className="mt-4 text-sm font-medium text-blue-500">{price}$/hr</p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={editHref || "#"}
                            className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 text-center"
                        >
                            Edit Space
                        </Link>
                        <button
                            onClick={onDelete}
                            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                        >
                            Delete Space
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}