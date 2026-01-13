import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Trash2, User, Loader2, Edit2, X, Check } from 'lucide-react';
import commentService from '../services/comment.service';
import useAuthStore from '../store/useAuthStore';

const CommentSection = ({ taskId }) => {
    const { user } = useAuthStore();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const fetchComments = async () => {
        try {
            const data = await commentService.getComments(taskId);
            setComments(data);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (taskId) {
            fetchComments();
        }
    }, [taskId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const addedComment = await commentService.createComment(taskId, newComment);
            setComments([...comments, addedComment]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to add comment:', err);
            alert('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            await commentService.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment:', err);
            alert('Failed to delete comment');
        }
    };

    const handleEdit = (comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    const handleSaveEdit = async (commentId) => {
        if (!editContent.trim()) return;

        try {
            const updatedComment = await commentService.updateComment(commentId, editContent);
            setComments(comments.map(c => c.id === commentId ? updatedComment : c));
            setEditingId(null);
            setEditContent('');
        } catch (err) {
            console.error('Failed to update comment:', err);
            alert('Failed to update comment');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-brand-primary" size={24} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
                <MessageSquare size={20} className="text-brand-primary" />
                <h3 className="text-xl font-bold">Comments ({comments.length})</h3>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {comments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 text-slate-500 bg-white/5 rounded-2xl border border-white/10"
                        >
                            <p>No comments yet. Start the discussion!</p>
                        </motion.div>
                    ) : (
                        comments.map((comment) => {
                            const isEditing = editingId === comment.id;
                            const isOwner = user?.id === comment.userId?._id || user?.id === comment.userId?.id || user?.id === comment.user?.id;

                            return (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {comment.user?.username || comment.userId?.username || 'Unknown User'}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(comment.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        {isOwner && !isEditing && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(comment)}
                                                    className="p-2 text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                                    title="Edit Comment"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete Comment"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing ? (
                                        <div className="pl-11 space-y-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/10 transition-all text-white text-sm resize-none min-h-[80px]"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSaveEdit(comment.id)}
                                                    className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all text-sm flex items-center gap-1"
                                                >
                                                    <Check size={14} />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 transition-all text-sm flex items-center gap-1"
                                                >
                                                    <X size={14} />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-300 text-sm pl-11 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-14 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white placeholder:text-slate-600 resize-none min-h-[100px]"
                    disabled={submitting}
                />
                <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="absolute bottom-4 right-4 p-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-primary/20"
                >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
            </form>
        </div>
    );
};

export default CommentSection;
