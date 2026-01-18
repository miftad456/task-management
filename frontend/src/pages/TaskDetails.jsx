import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar,
    Flag,
    CheckCircle2,
    Clock,
    ArrowLeft,
    FileText,
    Download,
    Loader2,
    Image as ImageIcon,
    Send,
    ThumbsUp,
    ThumbsDown,
    AlertCircle
} from 'lucide-react';
import taskService from '../services/task.service';
import submissionService from '../services/submission.service';
import CommentSection from '../components/CommentSection';
import useAuthStore from '../store/useAuthStore';
import { API_BASE_URL } from '../config';

const TaskDetails = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [submissionLink, setSubmissionLink] = useState('');
    const [submissionNote, setSubmissionNote] = useState('');
    const [reviewAction, setReviewAction] = useState('');
    const [reviewNote, setReviewNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const data = await taskService.getTaskById(taskId);
                setTask(data);
            } catch (err) {
                console.error('Failed to fetch task:', err);
                setError('Failed to load task details.');
            } finally {
                setLoading(false);
            }
        };

        if (taskId) {
            fetchTask();
        }
    }, [taskId]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-500/10';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10';
            case 'low': return 'text-green-500 bg-green-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-500 bg-green-500/10';
            case 'in-progress': return 'text-blue-500 bg-blue-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    const handleDownload = (attachment) => {
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = `${API_BASE_URL}${attachment.url}`; // Assuming backend is on port 3000
        link.setAttribute('download', attachment.originalName);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmitTask = async () => {
        setSubmitting(true);
        try {
            const updatedTask = await submissionService.submitTask(taskId, submissionLink, submissionNote);
            setTask(updatedTask);
            setShowSubmitDialog(false);
            setSubmissionLink('');
            setSubmissionNote('');
            alert('Task submitted for review successfully!');
        } catch (err) {
            console.error('Failed to submit task:', err);
            alert('Failed to submit task: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleReviewTask = async () => {
        if (!reviewAction) return;

        setSubmitting(true);
        try {
            const updatedTask = await submissionService.reviewTask(taskId, reviewAction, reviewNote);
            setTask(updatedTask);
            setShowReviewDialog(false);
            setReviewAction('');
            setReviewNote('');
            alert(`Task ${reviewAction}d successfully!`);
        } catch (err) {
            console.error('Failed to review task:', err);
            alert('Failed to review task: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setSubmitting(true);
        try {
            const updatedTask = await taskService.updateStatus(taskId, newStatus);
            setTask(updatedTask);
            alert('Status updated successfully!');
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmitTask = task && task.status === 'in-progress' && task.userId === user?.id;
    const canReviewTask = task && task.status === 'submitted' && task.assignedBy === user?.id;

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-primary" size={48} />
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-bold text-white mb-2">Task not found</h3>
                <p className="text-slate-400 mb-6">{error || "The requested task could not be found."}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-brand-primary hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-8 rounded-3xl space-y-8"
            >
                <header className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                                {task.priority} Priority
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                                {task.status.replace('-', ' ')}
                            </span>
                        </div>

                        {task.userId === user?.id && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Update Status:</span>
                                <select
                                    value={task.status}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                    disabled={submitting || task.status === 'submitted'}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    {(!task.assignedBy || task.assignedBy === user?.id) && (
                                        <option value="completed">Completed</option>
                                    )}
                                </select>
                            </div>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{task.title}</h1>
                </header>

                <div className="flex flex-wrap gap-6 text-slate-400 border-y border-white/10 py-6">
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-brand-primary" />
                        <span>Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={20} className="text-brand-primary" />
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Description</h3>
                    <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {task.description}
                    </div>
                </div>

                {/* Task Submission Section (for assigned users) */}
                {canSubmitTask && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Send size={20} className="text-brand-primary" />
                                <h3 className="text-lg font-bold text-white">Submit for Review</h3>
                            </div>
                            <button
                                onClick={() => setShowSubmitDialog(true)}
                                className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                            >
                                <Send size={18} />
                                Submit Task
                            </button>
                        </div>
                    </div>
                )}

                {/* Task Review Section (for managers) */}
                {canReviewTask && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle size={20} className="text-yellow-500" />
                            <h3 className="text-lg font-bold text-white">Review Submission</h3>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 space-y-4">
                            <p className="text-yellow-500 text-sm font-medium">This task has been submitted for your review.</p>

                            {task.submissionLink && (
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Submission Link</p>
                                    <a
                                        href={task.submissionLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-primary hover:underline break-all flex items-center gap-2"
                                    >
                                        <FileText size={16} />
                                        {task.submissionLink}
                                    </a>
                                </div>
                            )}

                            {task.submissionNote && (
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Member Note</p>
                                    <p className="text-slate-300 text-sm italic">"{task.submissionNote}"</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => { setReviewAction('approve'); setShowReviewDialog(true); }}
                                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                    <ThumbsUp size={18} />
                                    Approve
                                </button>
                                <button
                                    onClick={() => { setReviewAction('reject'); setShowReviewDialog(true); }}
                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                    <ThumbsDown size={18} />
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submission Details for Member */}
                {task.status === 'submitted' && !canReviewTask && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-blue-500">
                            <Clock size={18} />
                            <p className="font-semibold">Task submitted and awaiting review</p>
                        </div>
                        {task.submissionLink && (
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Your Submission Link</p>
                                <a href={task.submissionLink} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline break-all block text-sm">
                                    {task.submissionLink}
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* Manager Feedback Display */}
                {task.managerFeedback && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <ThumbsUp size={20} className="text-green-500" />
                            <h3 className="text-lg font-bold text-white">Manager Feedback</h3>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <p className="text-slate-300 italic">"{task.managerFeedback}"</p>
                        </div>
                    </div>
                )}

                {task.attachments && task.attachments.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <h3 className="text-xl font-bold text-white">Attachments</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {task.attachments.map((file, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                                                {file.mimetype.startsWith('image/') ? <ImageIcon size={24} /> : <FileText size={24} />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-white truncate">{file.originalName}</p>
                                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(file)}
                                            className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                                            title="Download"
                                        >
                                            <Download size={20} />
                                        </button>
                                    </div>

                                    {/* Image Preview */}
                                    {file.mimetype.startsWith('image/') && (
                                        <div className="mt-4 rounded-lg overflow-hidden border border-white/5 bg-black/20">
                                            <img
                                                src={`${API_BASE_URL}${file.url}`}
                                                alt={file.originalName}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-8 border-t border-white/10">
                    <CommentSection taskId={task.id || task._id} />
                </div>
            </motion.div>

            {/* Submit Task Dialog */}
            {showSubmitDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4"
                    >
                        <h3 className="text-xl font-bold text-white">Submit Task for Review</h3>
                        <p className="text-slate-400 text-sm">Provide a link to your work and an optional note.</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Submission Link</label>
                                <input
                                    type="url"
                                    value={submissionLink}
                                    onChange={(e) => setSubmissionLink(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white placeholder:text-slate-600"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Note (Optional)</label>
                                <textarea
                                    value={submissionNote}
                                    onChange={(e) => setSubmissionNote(e.target.value)}
                                    placeholder="Add a note..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white placeholder:text-slate-600 resize-none min-h-[100px]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmitTask}
                                disabled={submitting}
                                className="flex-1 px-4 py-3 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                Submit
                            </button>
                            <button
                                onClick={() => { setShowSubmitDialog(false); setSubmissionLink(''); setSubmissionNote(''); }}
                                disabled={submitting}
                                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-semibold transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Review Task Dialog */}
            {showReviewDialog && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4"
                    >
                        <h3 className="text-xl font-bold text-white">
                            {reviewAction === 'approve' ? 'Approve Task' : 'Reject Task'}
                        </h3>
                        <p className="text-slate-400 text-sm">Add optional feedback for the team member.</p>
                        <textarea
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                            placeholder="Add feedback (optional)..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all text-white placeholder:text-slate-600 resize-none min-h-[100px]"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleReviewTask}
                                disabled={submitting}
                                className={`flex-1 px-4 py-3 ${reviewAction === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} disabled:opacity-50 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2`}
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : reviewAction === 'approve' ? <ThumbsUp size={18} /> : <ThumbsDown size={18} />}
                                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                            <button
                                onClick={() => { setShowReviewDialog(false); setReviewAction(''); setReviewNote(''); }}
                                disabled={submitting}
                                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-semibold transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default TaskDetails;
