// src/components/AdminCommentsClient.tsx
"use client";

import { useEffect, useState } from "react";
import getAllComments from "@/libs/getAllComments";
import deleteComment from "@/libs/deleteComment";
import { Rating } from "@mui/material";

type Comment = {
    _id: string;
    message: string;
    rating?: number;
    spaceName: string;
    spaceId: string;
    createdAt: string;
    reportStatus?: string;
    reportCount?: number;
    user: { _id: string; name?: string; email?: string } | string;
};

type FilterType = "all" | "reported";
type SortByType = "date" | "reports";
type SortOrderType = "asc" | "desc";

export default function AdminCommentsClient({ token }: { token: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filtering & Searching State
    const [filter, setFilter] = useState<FilterType>("reported");
    const [searchTerm, setSearchTerm] = useState("");
    
    // Sorting State
    const [sortBy, setSortBy] = useState<SortByType>("date");
    const [sortOrder, setSortOrder] = useState<SortOrderType>("desc");

    // Action State
    const [hidingId, setHidingId] = useState<string | null>(null);
    const [dismissingId, setDismissingId] = useState<string | null>(null);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await getAllComments();
            setComments(data);
        } catch (err) {
            console.error("Failed to load comments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComments();
    }, []);

    // Hide = permanently delete the comment
    const handleHide = async (comment: Comment) => {
        const userName =
            typeof comment.user === "string"
                ? "this user"
                : comment.user?.name || comment.user?.email || "this user";

        if (
            !confirm(
                `Delete comment by ${userName}? This action cannot be undone.`
            )
        )
            return;

        try {
            setHidingId(comment._id);
            await deleteComment(comment._id, token);
            setComments((prev) => prev.filter((c) => c._id !== comment._id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete comment.");
        } finally {
            setHidingId(null);
        }
    };

    // Dismiss = mark report as reviewed
    const handleDismiss = async (comment: Comment) => {
        if (!confirm("Dismiss this report? The comment will remain visible."))
            return;

        try {
            setDismissingId(comment._id);

            const response = await fetch(
                `https://swdevprac-project-backend.vercel.app/api/v1/comments/${comment._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        message: comment.message,
                        rating: comment.rating,
                        reportStatus: "none",
                        reportCount: 0,
                    }),
                }
            );

            if (!response.ok) throw new Error("Failed to dismiss report");

            setComments((prev) =>
                prev.map((c) =>
                    c._id === comment._id
                        ? { ...c, reportStatus: "none", reportCount: 0 }
                        : c
                )
            );
        } catch (err) {
            console.error(err);
            alert("Failed to dismiss report.");
        } finally {
            setDismissingId(null);
        }
    };

    const handleSort = (type: SortByType) => {
        if (sortBy === type) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(type);
            setSortOrder("desc"); // Default to desc (newest/most reported first) when switching types
        }
    };

    const displayedComments = comments
        .filter((c) => {
            if (filter === "reported") return c.reportStatus === "reported";
            return true;
        })
        .filter((c) => {
            if (!searchTerm.trim()) return true;
            const kw = searchTerm.toLowerCase();
            const userName =
                typeof c.user === "string"
                    ? ""
                    : (c.user?.name || c.user?.email || "").toLowerCase();
            return (
                c.message.toLowerCase().includes(kw) ||
                c.spaceName.toLowerCase().includes(kw) ||
                userName.includes(kw)
            );
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === "date") {
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortBy === "reports") {
                comparison = (a.reportCount || 0) - (b.reportCount || 0);
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });

    const reportedCount = comments.filter(
        (c) => c.reportStatus === "reported"
    ).length;

    return (
        <main className="min-h-screen bg-[#f5f7fb] px-6 py-10">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Manage Comments
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Review reported comments and moderate content
                        </p>
                    </div>

                    {reportedCount > 0 && (
                        <div className="inline-flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5">
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-sm font-semibold text-red-700">
                                {reportedCount} reported comment
                                {reportedCount !== 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                </div>

                {/* Table Card */}
                <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
                        
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Filter tabs */}
                            <div className="flex shrink-0 gap-1 rounded-xl bg-gray-100 p-1">
                                <button
                                    onClick={() => setFilter("reported")}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                        filter === "reported"
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Reported
                                    {reportedCount > 0 && (
                                        <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                                            {reportedCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setFilter("all")}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                        filter === "all"
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    All Comments
                                </button>
                            </div>

                            <div className="hidden h-6 w-px bg-gray-200 sm:block" />

                            {/* Sort Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSort("date")}
                                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                        sortBy === "date"
                                            ? "border-blue-200 bg-blue-50 text-blue-700"
                                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    Date
                                    {sortBy === "date" && (
                                        <span className="text-xs">
                                            {sortOrder === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleSort("reports")}
                                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                                        sortBy === "reports"
                                            ? "border-blue-200 bg-blue-50 text-blue-700"
                                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    Reports
                                    {sortBy === "reports" && (
                                        <span className="text-xs">
                                            {sortOrder === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search by user, space, or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 xl:w-72"
                        />
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-50 text-sm text-gray-500">
                                <tr>
                                    <th className="px-5 py-4 font-medium">
                                        User
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Space
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Comment
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 font-medium text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-16 text-center text-gray-400"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                                <span className="text-sm">
                                                    Loading comments...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : displayedComments.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <span className="text-3xl">
                                                    ✅
                                                </span>
                                                <p className="text-sm font-medium">
                                                    {filter === "reported"
                                                        ? "No reported comments — all clear!"
                                                        : "No comments found."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    displayedComments.map((comment) => {
                                        const userName =
                                            typeof comment.user === "string"
                                                ? "Unknown User"
                                                : comment.user?.name ||
                                                  comment.user?.email ||
                                                  "Unknown User";

                                        const isReported =
                                            comment.reportStatus === "reported";

                                        return (
                                            <tr
                                                key={comment._id}
                                                className={`border-t border-gray-100 text-sm transition-colors hover:bg-gray-50/50 ${
                                                    isReported
                                                        ? "bg-red-50/30"
                                                        : ""
                                                }`}
                                            >
                                                {/* User */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                                                            {userName
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {userName}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {new Date(
                                                                    comment.createdAt
                                                                ).toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        year: "numeric",
                                                                    }
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Space */}
                                                <td className="px-5 py-4 align-top">
                                                    <p className="font-medium text-gray-900">
                                                        {comment.spaceName}
                                                    </p>
                                                </td>

                                                {/* Comment content */}
                                                <td className="max-w-xs px-5 py-4 align-top">
                                                    <Rating
                                                        value={
                                                            comment.rating || 0
                                                        }
                                                        readOnly
                                                        size="small"
                                                    />
                                                    <p className="mt-1 text-gray-600 line-clamp-3">
                                                        {comment.message}
                                                    </p>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4 align-top">
                                                    {isReported ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="inline-flex w-max items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                                                ⚠️ Reported
                                                            </span>
                                                            {(comment.reportCount ||
                                                                0) > 0 && (
                                                                <span className="text-xs text-gray-400">
                                                                    {
                                                                        comment.reportCount
                                                                    }{" "}
                                                                    report
                                                                    {comment.reportCount !==
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex w-max items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                                            ✓ Clear
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="flex flex-col items-end gap-2">
                                                        {/* Hide (delete) — always available */}
                                                        <button
                                                            onClick={() =>
                                                                handleHide(
                                                                    comment
                                                                )
                                                            }
                                                            disabled={
                                                                hidingId ===
                                                                comment._id
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {hidingId ===
                                                            comment._id ? (
                                                                <>
                                                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                                    Deleting...
                                                                </>
                                                            ) : (
                                                                "Delete Comment"
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer count */}
                    {!loading && displayedComments.length > 0 && (
                        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
                            Showing {displayedComments.length} comment
                            {displayedComments.length !== 1 ? "s" : ""}
                            {filter === "reported" ? " (reported only)" : ""}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}