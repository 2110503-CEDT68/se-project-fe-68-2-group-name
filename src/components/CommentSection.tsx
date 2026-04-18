"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createComment from "@/libs/createComment";
import updateComment from "@/libs/updateComment";
import deleteComment from "@/libs/deleteComment";
import getUserProfile from "@/libs/getUserProfile";
import { CommentItem } from "../../interfaces";
import getCommentsByCoworking from "@/libs/getCommentsByCoworking";

export default function CommentSection({
    spaceId,
    token,
}: {
    spaceId: string;
    token: string | null;
}) {
    const router = useRouter();

    const [comments, setComments] = useState<CommentItem[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedMessage, setEditedMessage] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

    async function fetchComments() {
        try {
            setLoading(true);
            const data = await getCommentsByCoworking(spaceId);
            setComments(data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchCurrentUser() {
        if (!token) {
            setCurrentUserId(null);
            setCurrentUserRole(null);
            return;
        }

        try {
            const data = await getUserProfile(token);
            const user = data.data;

            setCurrentUserId(user?._id || null);
            setCurrentUserRole(user?.role || null);
        } catch (error) {
            console.error(error);
            setCurrentUserId(null);
            setCurrentUserRole(null);
        }
    }

    useEffect(() => {
        fetchComments();
        fetchCurrentUser();
        setVisibleCount(5);
        setEditingCommentId(null);
        setEditedMessage("");
    }, [spaceId, token]);

    const handleSubmit = async () => {
        if (!token) {
            alert("Please sign in to comment.");
            router.push("/login");
            return;
        }

        if (!message.trim()) {
            alert("Please enter a comment.");
            return;
        }

        try {
            setPosting(true);
            await createComment(spaceId, message, token);
            setMessage("");
            await fetchComments();
        } catch (error) {
            console.error(error);
            alert("Failed to post comment.");
        } finally {
            setPosting(false);
        }
    };

    const handleStartEdit = (comment: CommentItem) => {
        setEditingCommentId(comment._id);
        setEditedMessage(comment.message);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditedMessage("");
    };

    const handleSaveEdit = async (commentId: string) => {
        if (!token) {
            alert("Please sign in first.");
            router.push("/login");
            return;
        }

        if (!editedMessage.trim()) {
            alert("Please enter a comment.");
            return;
        }

        try {
            setSavingEdit(true);
            await updateComment(commentId, { message: editedMessage }, token);
            setEditingCommentId(null);
            setEditedMessage("");
            await fetchComments();
        } catch (error) {
            console.error(error);
            alert("Failed to update comment.");
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!token) {
            alert("Please sign in first.");
            router.push("/login");
            return;
        }

        const confirmed = window.confirm("Are you sure you want to delete this comment?");
        if (!confirmed) return;

        try {
            setDeletingCommentId(commentId);
            await deleteComment(commentId, token);
            await fetchComments();
        } catch (error) {
            console.error(error);
            alert("Failed to delete comment.");
        } finally {
            setDeletingCommentId(null);
        }
    };

    return (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700">Comments</h2>
            <p className="mt-1 text-sm text-gray-500">
                Share your experience about this workspace
            </p>

            <div className="mt-4">
                <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your comment here..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                />
                <button
                    onClick={handleSubmit}
                    disabled={posting}
                    className="mt-3 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                    {posting ? "Posting..." : "Post Comment"}
                </button>
            </div>

            <div className="mt-6 space-y-4">
                {loading ? (
                    <p className="text-sm text-gray-500">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-gray-500">No comments yet.</p>
                ) : (
                    <>
                        {comments.slice(0, visibleCount).map((comment) => {
                            const commentUserId =
                                typeof comment.user === "string"
                                    ? comment.user
                                    : comment.user?._id;

                            const isOwner = currentUserId === commentUserId;
                            const isAdmin = currentUserRole === "admin";
                            const canEdit = isOwner;
                            const canDelete = isOwner || isAdmin;
                            const isEditing = editingCommentId === comment._id;

                            return (
                                <div
                                    key={comment._id}
                                    className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {typeof comment.user === "string"
                                                ? "User"
                                                : comment.user?.name || comment.user?.email || "User"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {isEditing ? (
                                        <div className="mt-3">
                                            <textarea
                                                rows={3}
                                                value={editedMessage}
                                                onChange={(e) => setEditedMessage(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                                            />
                                            <div className="mt-3 flex gap-2">
                                                <button
                                                    onClick={() => handleSaveEdit(comment._id)}
                                                    disabled={savingEdit}
                                                    className="rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
                                                >
                                                    {savingEdit ? "Saving..." : "Save"}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    disabled={savingEdit}
                                                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-600">
                                            {comment.message}
                                        </p>
                                    )}

                                    {(canEdit || canDelete) && !isEditing && (
                                        <div className="mt-3 flex gap-2">
                                            {canEdit && (
                                                <button
                                                    onClick={() => handleStartEdit(comment)}
                                                    className="rounded-xl border border-blue-300 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                                >
                                                    Edit
                                                </button>
                                            )}

                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(comment._id)}
                                                    disabled={deletingCommentId === comment._id}
                                                    className="rounded-xl border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    {deletingCommentId === comment._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {visibleCount < comments.length && (
                            <button
                                onClick={() => setVisibleCount((prev) => prev + 5)}
                                className="mt-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Show more
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}