"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import createComment from "@/libs/createComment";
import updateComment from "@/libs/updateComment";
import deleteComment from "@/libs/deleteComment";
import reportComment from "@/libs/reportComment";
import getUserProfile from "@/libs/getUserProfile";
import { CommentItem } from "../../interfaces";
import getCommentsByCoworking from "@/libs/getCommentsByCoworking";
import createCustomEmoji from "@/libs/createCustomEmoji";
import getCustomEmojis from "@/libs/getCustomEmojis";
import deleteCustomEmoji from "@/libs/deleteCustomEmoji";
import toggleReaction from "@/libs/toggleReaction";
import { Rating } from "@mui/material";

const DEFAULT_EMOJIS = ["👍", "❤️", "👌", "👎"];
const SYSTEM_EMOJIS = ["😀", "😂", "🥰", "😎", "😭", "🙏", "🔥", "✨", "🎉", "💯"];

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
    const [rating, setRating] = useState<number | null>(0);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedMessage, setEditedMessage] = useState("");
    const [editedRating, setEditedRating] = useState<number | null>(0);
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

    // --- Emoji States ---
    const [activeEmojiPickerId, setActiveEmojiPickerId] = useState<string | null>(null);
    const [customEmojis, setCustomEmojis] = useState<any[]>([]);
    const [isAddEmojiModalOpen, setIsAddEmojiModalOpen] = useState(false);
    const [newEmojiName, setNewEmojiName] = useState("");
    const [newEmojiFile, setNewEmojiFile] = useState<File | null>(null);
    const [uploadingEmoji, setUploadingEmoji] = useState(false);

    // Track which reactions are currently being toggled (for loading state)
    const [togglingReactions, setTogglingReactions] = useState<Set<string>>(new Set());

    const pickerRef = useRef<HTMLDivElement>(null);

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

    async function fetchCurrentUserAndEmojis() {
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

            const emojisData = await getCustomEmojis(token);
            setCustomEmojis(emojisData.data || []);
        } catch (error) {
            console.error(error);
            setCurrentUserId(null);
            setCurrentUserRole(null);
        }
    }

    useEffect(() => {
        fetchComments();
        fetchCurrentUserAndEmojis();
        setVisibleCount(5);
        setEditingCommentId(null);
        setEditedMessage("");
    }, [spaceId, token]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setActiveEmojiPickerId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- Comment Actions ---
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
            await createComment(spaceId, message, rating, token);
            setMessage("");
            setRating(0);
            await fetchComments();
        } catch (error: any) {
            console.error(error);
            const msg = error?.message || "";
            if (msg.toLowerCase().includes("blocked")) {
                alert("Your account has been blocked by an admin. You cannot post comments.");
            } else {
                alert("Failed to post comment.");
            }
        } finally {
            setPosting(false);
        }
    };

    const handleStartEdit = (comment: CommentItem) => {
        setEditingCommentId(comment._id);
        setEditedMessage(comment.message);
        setEditedRating((comment as any).rating || 0);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditedMessage("");
        setEditedRating(0);
    };

    const handleSaveEdit = async (commentId: string) => {
        if (!token) { alert("Please sign in first."); router.push("/login"); return; }
        if (!editedMessage.trim()) { alert("Please enter a comment."); return; }
        try {
            setSavingEdit(true);
            await updateComment(commentId, { message: editedMessage, rating: editedRating }, token);
            setEditingCommentId(null);
            setEditedMessage("");
            setEditedRating(0);
            await fetchComments();
        } catch (error) {
            console.error(error);
            alert("Failed to update comment.");
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!token) { alert("Please sign in first."); router.push("/login"); return; }
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
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

    const handleReport = async (commentId: string) => {
        if (!token) { alert("Please sign in first."); router.push("/login"); return; }
        if (!window.confirm("Are you sure you want to report this comment?")) return;
        try {
            setReportingCommentId(commentId);
            await reportComment(commentId, token);
            alert("Comment reported successfully.");
            await fetchComments();
        } catch (error) {
            console.error(error);
            alert("Failed to report comment. You might have already reported it.");
        } finally {
            setReportingCommentId(null);
        }
    };

    // --- Optimistic Reaction Toggle (เรียลไทม์ ไม่ refetch) ---
    const handleReactionClick = async (commentId: string, emojiType: 'default' | 'custom', value: any) => {
        if (!token) {
            alert("Please sign in to react.");
            router.push("/login");
            return;
        }

        // emojiValue คือ string สำหรับ default, object/string สำหรับ custom
        const emojiValue = emojiType === 'default'
            ? value
            : (typeof value === 'string' ? value : value._id);

        const reactionKey = `${commentId}-${emojiValue}`;

        // ป้องกัน double-click
        if (togglingReactions.has(reactionKey)) return;
        setTogglingReactions(prev => new Set(prev).add(reactionKey));
        setActiveEmojiPickerId(null);

        // === Optimistic Update ===
        setComments(prevComments =>
            prevComments.map(comment => {
                if (comment._id !== commentId) return comment;

                const reactions: any[] = (comment as any).reactions || [];
                const existingIndex = reactions.findIndex(
                    r => r.emojiValue === emojiValue && (typeof r.user === 'string' ? r.user : r.user?._id) === currentUserId
                );

                let newReactions: any[];
                if (existingIndex !== -1) {
                    // ลบ reaction ออก (toggle off)
                    newReactions = reactions.filter((_, i) => i !== existingIndex);
                } else {
                    // เพิ่ม reaction ใหม่ (toggle on)
                    const newReaction: any = {
                        _id: `temp-${Date.now()}`,
                        comment: commentId,
                        user: currentUserId,
                        emojiType,
                        emojiValue,
                        status: 'active',
                    };
                    if (emojiType === 'custom') {
                        newReaction.customEmoji = typeof value === 'string'
                            ? customEmojis.find(e => e._id === value)
                            : value;
                    }
                    newReactions = [...reactions, newReaction];
                }

                return { ...comment, reactions: newReactions } as any;
            })
        );

        // === Sync กับ Backend ===
        try {
            await toggleReaction(commentId, emojiType, value, token);
        } catch (error) {
            console.error(error);
            // Rollback: refetch จาก server ถ้า error
            await fetchComments();
            alert("Failed to update reaction.");
        } finally {
            setTogglingReactions(prev => {
                const next = new Set(prev);
                next.delete(reactionKey);
                return next;
            });
        }
    };

    const handleCreateCustomEmoji = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmojiName.trim() || !newEmojiFile || !token) return;

        try {
            setUploadingEmoji(true);
            await createCustomEmoji(newEmojiName, newEmojiFile, token);
            const emojisData = await getCustomEmojis(token);
            setCustomEmojis(emojisData.data || []);

            setIsAddEmojiModalOpen(false);
            setNewEmojiName("");
            setNewEmojiFile(null);
            alert("Custom emoji added!");
        } catch (error) {
            console.error(error);
            alert("Failed to upload custom emoji.");
        } finally {
            setUploadingEmoji(false);
        }
    };

    const handleDeleteCustomEmoji = async (emojiId: string) => {
        if (!token) return;
        if (!window.confirm("Are you sure you want to delete this emoji?")) return;

        try {
            await deleteCustomEmoji(emojiId, token);
            setCustomEmojis((prev) => prev.filter((e) => e._id !== emojiId));
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Failed to delete emoji.");
        }
    };

    // จัดกลุ่ม Reaction
    const getGroupedReactions = (reactions: any[]) => {
        if (!reactions || reactions.length === 0) return [];
        const groups: Record<string, { type: string, value: any, count: number, hasReacted: boolean }> = {};

        reactions.forEach((r) => {
            const key = r.emojiType === 'custom' ? (r.customEmoji?._id || r.customEmoji) : r.emojiValue;
            const rUserId = typeof r.user === 'string' ? r.user : r.user?._id;
            const isMe = rUserId === currentUserId;

            if (!groups[key]) {
                groups[key] = {
                    type: r.emojiType,
                    value: r.emojiType === 'custom' ? r.customEmoji : r.emojiValue,
                    count: 0,
                    hasReacted: false,
                };
            }

            groups[key].count += 1;
            if (isMe) groups[key].hasReacted = true;
        });

        return Object.values(groups);
    };

    return (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm relative">
            <h2 className="text-sm font-semibold text-gray-700">Comments</h2>
            <p className="mt-1 text-sm text-gray-500">Share your experience about this workspace</p>

            <div className="mt-4">
                <div className="mb-3 flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-medium">Your Rating:</span>
                    <Rating name="workspace-rating" value={rating} onChange={(_, v) => setRating(v)} />
                </div>
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
                    <p className="text-sm text-gray-500 mx-1">No comments yet.</p>
                ) : (
                    <>
                        {comments.slice(0, visibleCount).map((comment) => {
                            const commentUserId = typeof comment.user === "string" ? comment.user : comment.user?._id;
                            const isOwner = currentUserId === commentUserId;
                            const isAdmin = currentUserRole === "admin";
                            const canEdit = isOwner;
                            const canDelete = isOwner || isAdmin;
                            const isEditing = editingCommentId === comment._id;
                            const reportStatus = (comment as any).reportStatus;
                            const reportCount = (comment as any).reportCount || 0;
                            const groupedReactions = getGroupedReactions((comment as any).reactions || []);

                            return (
                                <div
                                    key={comment._id}
                                    className="group relative rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-gray-100 transition"
                                >
                                    {/* Reaction Hover Bar */}
                                    <div className="hidden group-hover:flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm absolute -top-4 right-4 z-10">
                                        {DEFAULT_EMOJIS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => handleReactionClick(comment._id, 'default', emoji)}
                                                disabled={togglingReactions.has(`${comment._id}-${emoji}`)}
                                                className="hover:bg-gray-100 rounded-md w-8 h-8 flex items-center justify-center transition text-lg disabled:opacity-50"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                                        <button
                                            onClick={() => setActiveEmojiPickerId(activeEmojiPickerId === comment._id ? null : comment._id)}
                                            className="hover:bg-gray-100 text-gray-500 rounded-md w-8 h-8 flex items-center justify-center transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                                        </button>

                                        {/* Emoji Picker Popup */}
                                        {activeEmojiPickerId === comment._id && (
                                            <div ref={pickerRef} className="absolute top-10 right-0 bg-white border border-gray-200 shadow-xl rounded-xl p-4 w-72 z-50 cursor-default">
                                                <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">System Emojis</h4>
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {SYSTEM_EMOJIS.map((emoji) => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => handleReactionClick(comment._id, 'default', emoji)}
                                                            disabled={togglingReactions.has(`${comment._id}-${emoji}`)}
                                                            className="text-xl hover:bg-gray-100 rounded-md w-8 h-8 flex items-center justify-center transition disabled:opacity-50"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Custom Emojis</h4>
                                                </div>

                                                {customEmojis.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto pr-1">
                                                        {customEmojis.map((emoji) => (
                                                            <div key={emoji._id} className="relative group/emoji">
                                                                <button
                                                                    onClick={() => handleReactionClick(comment._id, 'custom', emoji)}
                                                                    disabled={togglingReactions.has(`${comment._id}-${emoji._id}`)}
                                                                    className="hover:bg-gray-100 p-1 rounded-md transition disabled:opacity-50"
                                                                >
                                                                    <img src={emoji.imageUrl} alt={emoji.name} className="w-8 h-8 rounded object-cover" title={emoji.name} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCustomEmoji(emoji._id); }}
                                                                    className="hidden group-hover/emoji:flex absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 items-center justify-center text-[10px] shadow-sm hover:bg-red-600"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400 mb-4 text-center py-2 bg-gray-50 rounded-lg">No custom emojis yet.</p>
                                                )}

                                                <button
                                                    onClick={() => { setIsAddEmojiModalOpen(true); setActiveEmojiPickerId(null); }}
                                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 text-sm font-medium py-2 rounded-lg transition flex justify-center items-center gap-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                                    Add New Emoji
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between !my-2">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {typeof comment.user === "string" ? "User" : comment.user?.name || comment.user?.email || "User"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {isEditing ? (
                                        <div className="mt-3">
                                            <div className="mb-3 flex items-center gap-2">
                                                <span className="text-sm text-gray-700 font-medium">Edit Rating:</span>
                                                <Rating name="edit-workspace-rating" value={editedRating} onChange={(_, v) => setEditedRating(v)} />
                                            </div>
                                            <textarea
                                                rows={3}
                                                value={editedMessage}
                                                onChange={(e) => setEditedMessage(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
                                            />
                                            <div className="mt-3 flex gap-2">
                                                <button onClick={() => handleSaveEdit(comment._id)} disabled={savingEdit} className="rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50">
                                                    {savingEdit ? "Saving..." : "Save"}
                                                </button>
                                                <button onClick={handleCancelEdit} disabled={savingEdit} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <Rating value={(comment as any).rating || 0} readOnly size="small" />
                                            <p className="mt-2 text-sm text-gray-600 mx-1 break-words">{comment.message}</p>
                                        </div>
                                    )}

                                    {/* Active Reactions */}
                                    {groupedReactions.length > 0 && !isEditing && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {groupedReactions.map((grp, idx) => {
                                                const reactionKey = `${comment._id}-${grp.type === 'custom' ? (grp.value?._id || grp.value) : grp.value}`;
                                                const isToggling = togglingReactions.has(reactionKey);
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleReactionClick(comment._id, grp.type as 'default' | 'custom', grp.value)}
                                                        disabled={isToggling}
                                                        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium transition ${
                                                            grp.hasReacted
                                                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                        } ${isToggling ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                    >
                                                        {grp.type === 'custom' ? (
                                                            <img src={grp.value?.imageUrl} alt="emoji" className="w-5 h-5 rounded object-cover" />
                                                        ) : (
                                                            <span className="text-base">{grp.value}</span>
                                                        )}
                                                        <span>{grp.count}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {!isOwner && !isAdmin && !isEditing && (
                                                <button
                                                    onClick={() => handleReport(comment._id)}
                                                    disabled={reportingCommentId === comment._id}
                                                    className="rounded-xl border border-yellow-600 px-3 py-1.5 text-sm font-medium text-yellow-600 hover:bg-yellow-50"
                                                >
                                                    {reportingCommentId === comment._id ? "Reporting..." : "Report"}
                                                </button>
                                            )}

                                            {isAdmin && reportStatus === "reported" && (
                                                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-600 border border-red-200">
                                                    ⚠️ Reported by {reportCount} user(s)
                                                </span>
                                            )}

                                            {(canEdit || canDelete) && !isEditing && (
                                                <div className="flex items-center gap-2">
                                                    {canEdit && (
                                                        <button onClick={() => handleStartEdit(comment)} className="rounded-xl border border-blue-300 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50">
                                                            Edit
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button onClick={() => handleDelete(comment._id)} disabled={deletingCommentId === comment._id} className="rounded-xl border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                                                            {deletingCommentId === comment._id ? "Deleting..." : "Delete"}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {visibleCount < comments.length && (
                            <button
                                onClick={() => setVisibleCount((prev) => prev + 5)}
                                className="mt-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Show more
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Modal: Add New Custom Emoji */}
            {isAddEmojiModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Create Custom Emoji</h3>
                        <form onSubmit={handleCreateCustomEmoji}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji Name</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={50}
                                    placeholder="e.g. peepoHappy"
                                    value={newEmojiName}
                                    onChange={(e) => setNewEmojiName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image File</label>
                                <input
                                    type="file"
                                    required
                                    accept="image/*"
                                    onChange={(e) => setNewEmojiFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition cursor-pointer"
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddEmojiModalOpen(false); setNewEmojiFile(null); setNewEmojiName(""); }}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadingEmoji || !newEmojiName || !newEmojiFile}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
                                >
                                    {uploadingEmoji ? "Uploading..." : "Upload Emoji"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
